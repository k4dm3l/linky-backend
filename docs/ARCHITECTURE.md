# Clean Architecture Implementation

This document explains the clean architecture implementation in this project, which follows Domain-Driven Design (DDD) principles and the Clean Architecture pattern.

## 🏗️ Architecture Overview

The application is structured in layers, with dependencies pointing inward toward the domain layer:

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Layer (API)                    │
│  Controllers, Routers, HTTP handling                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                          │
│  Use Cases, Commands, Queries, DTOs                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer                             │
│  Entities, Value Objects, Domain Services, Repositories    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure Layer                         │
│  Repository Implementations, External Services              │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
src/
├── app/                           # Infrastructure & Framework Layer
│   ├── config/                    # Application configuration
│   ├── di/                        # Dependency injection setup
│   │   ├── container.ts           # DI container implementation
│   │   └── setup.ts               # Service registration
│   ├── health/                    # Health check endpoints
│   └── server.ts                  # Express server setup
├── contexts/                      # Bounded Contexts (DDD)
│   ├── users/                     # User context
│   │   ├── domain/                # 🟢 Domain Layer
│   │   │   ├── entities/          # Business entities
│   │   │   ├── value-objects/     # Value objects
│   │   │   ├── repositories/      # Repository interfaces
│   │   │   ├── services/          # Domain services
│   │   │   └── exceptions/        # Domain exceptions
│   │   ├── application/           # 🟡 Application Layer
│   │   │   ├── use-cases/         # Application use cases
│   │   │   ├── commands/          # Command objects
│   │   │   ├── queries/           # Query objects
│   │   │   ├── dtos/              # Data transfer objects
│   │   │   └── results/           # Application results
│   │   ├── infrastructure/        # 🔵 Infrastructure Layer
│   │   │   └── repositories/      # Repository implementations
│   │   └── api/                   # 🔴 Interface Layer
│   │       ├── controllers/       # HTTP controllers
│   │       └── routers/           # Express routers
│   └── shared/                    # Shared components
│       └── logger/                # Logging interface & implementation
└── main.ts                        # Application entry point
```

## 🟢 Domain Layer

The domain layer contains the core business logic and is the heart of the application.

### Entities

Entities represent business objects with identity and lifecycle.

```typescript
// src/contexts/users/domain/entities/user.ts
export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly name: UserName,
    private readonly createdAt: Date,
  ) {}

  // Business logic methods
  updateProfile(newName: UserName): User {
    return new User(this.id, this.email, newName, this.createdAt);
  }

  canBeDeleted(): boolean {
    // Business rule: Users can only be deleted after 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.createdAt < twentyFourHoursAgo;
  }
}
```

**Key Characteristics:**

- **Immutable**: Properties are readonly, methods return new instances
- **Business Logic**: Contains domain rules and validation
- **Identity**: Has a unique identifier (UserId)
- **Lifecycle**: Can be created, updated, and deleted

### Value Objects

Value objects represent concepts that don't have identity but have value.

```typescript
// src/contexts/users/domain/value-objects/email.ts
export class Email {
  constructor(private readonly value: string) {
    this.validate();
  }

  private validate(): void {
    if (!this.value || this.value.trim().length === 0) {
      throw new Error("Email cannot be empty");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new Error("Email must be in a valid format");
    }
  }

  getValue(): string {
    return this.value.toLowerCase(); // Normalize
  }
}
```

**Key Characteristics:**

- **Immutable**: Cannot be changed after creation
- **Self-Validating**: Validates itself during construction
- **No Identity**: Two emails with the same value are equal
- **Domain Logic**: Contains business rules about what makes a valid email

### Repository Interfaces

Repository interfaces define contracts for data access without implementation details.

```typescript
// src/contexts/users/domain/repositories/user-repository.ts
export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  findAll(): Promise<User[]>;
  findWithPagination(
    offset: number,
    limit: number,
  ): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }>;
}
```

**Key Characteristics:**

- **Interface Only**: No implementation details
- **Domain Language**: Uses domain objects (User, UserId, Email)
- **Technology Agnostic**: Doesn't specify database or storage technology
- **Testable**: Easy to mock for testing

### Domain Services

Domain services contain business logic that doesn't belong to a single entity.

```typescript
// src/contexts/users/domain/services/user-domain-service.ts
export class UserDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(email: Email, name: UserName): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(email.getValue());
    }

    const user = new User(UserId.generate(), email, name, new Date());
    await this.userRepository.save(user);
    return user;
  }
}
```

**Key Characteristics:**

- **Orchestrates Entities**: Coordinates multiple entities
- **Business Rules**: Implements complex business logic
- **Repository Usage**: Uses repositories for data access
- **Domain Exceptions**: Throws domain-specific exceptions

## 🟡 Application Layer

The application layer orchestrates the domain objects to fulfill use cases.

### Use Cases

Use cases represent application-specific business operations.

```typescript
// src/contexts/users/application/use-cases/create-user-use-case.ts
export class CreateUserUseCase {
  constructor(
    private readonly userDomainService: UserDomainService,
    private readonly logger: Logger,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    try {
      // Validate input
      if (!command.email || !command.name) {
        return {
          success: false,
          error: "Email and name are required",
          errorCode: "VALIDATION_ERROR",
        };
      }

      // Create value objects
      const email = new Email(command.email);
      const name = new UserName(command.name);

      // Execute domain logic
      const user = await this.userDomainService.createUser(email, name);

      // Map to DTO
      const userDto: UserDto = {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        name: user.getName().getValue(),
        createdAt: user.getCreatedAt(),
      };

      return { success: true, data: userDto };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "INTERNAL_ERROR",
      };
    }
  }
}
```

**Key Characteristics:**

- **Single Responsibility**: Each use case handles one specific operation
- **Input Validation**: Validates and transforms input data
- **Error Handling**: Handles errors gracefully and returns structured results
- **DTO Mapping**: Converts domain objects to DTOs for the interface layer

### Commands and Queries

Commands represent write operations, queries represent read operations.

```typescript
// Commands
export interface CreateUserCommand {
  email: string;
  name: string;
}

export interface UpdateUserCommand {
  userId: string;
  name: string;
}

// Queries
export interface GetUserQuery {
  userId: string;
}

export interface GetUsersQuery {
  offset?: number;
  limit?: number;
  name?: string;
  domain?: string;
}
```

### DTOs (Data Transfer Objects)

DTOs define the structure of data passed between layers.

```typescript
export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface UserListDto {
  users: UserDto[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}
```

## 🔵 Infrastructure Layer

The infrastructure layer implements the interfaces defined in the domain layer.

### Repository Implementations

```typescript
// src/contexts/users/infrastructure/repositories/in-memory-user-repository.ts
export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: UserId): Promise<User | null> {
    return this.users.get(id.getValue()) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.getId().getValue(), user);
  }

  // ... other methods
}
```

**Key Characteristics:**

- **Implements Domain Interface**: Must implement the repository interface
- **Technology Specific**: Contains implementation details (in-memory, PostgreSQL, etc.)
- **Data Mapping**: Converts between domain objects and storage format
- **Transaction Support**: Handles database transactions when needed

## 🔴 Interface Layer

The interface layer handles external communication (HTTP, CLI, etc.).

### Controllers

```typescript
// src/contexts/users/api/user-controller.ts
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly logger: Logger,
  ) {}

  async createUser(req: Request, res: Response) {
    try {
      const result = await this.createUserUseCase.execute({
        email: req.body.email,
        name: req.body.name,
      });

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: result.error,
          errorCode: result.errorCode,
        });
      }

      return res.status(StatusCodes.CREATED).json(result.data);
    } catch (error) {
      this.logger.error("Unexpected error in createUser", { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error",
      });
    }
  }
}
```

**Key Characteristics:**

- **HTTP Handling**: Manages HTTP requests and responses
- **Use Case Coordination**: Orchestrates use cases
- **Error Handling**: Handles HTTP-specific errors
- **Input/Output Mapping**: Converts between HTTP and application formats

## 🔧 Dependency Injection

The application uses dependency injection to manage dependencies between layers.

### Container Setup

```typescript
// src/app/di/setup.ts
export function setupContainer(): Container {
  const container = new Container();

  // Register shared services
  container.registerSingleton("logger", () => new ConsoleLogger());

  // Register repositories
  container.registerSingleton(
    "userRepository",
    () => new InMemoryUserRepository(),
  );

  // Register domain services
  container.registerSingleton(
    "userDomainService",
    () => new UserDomainService(container.resolve("userRepository")),
  );

  // Register use cases
  container.registerSingleton(
    "createUserUseCase",
    () =>
      new CreateUserUseCase(
        container.resolve("userDomainService"),
        container.resolve("logger"),
      ),
  );

  return container;
}
```

## 🧪 Testing Strategy

Each layer has its own testing strategy:

### Domain Layer Tests

- **Unit Tests**: Test entities, value objects, and domain services in isolation
- **Business Rules**: Focus on business logic and validation
- **No Dependencies**: Pure business logic without external dependencies

### Application Layer Tests

- **Use Case Tests**: Test use cases with mocked dependencies
- **Integration Tests**: Test use cases with real domain services
- **Command/Query Tests**: Validate input/output contracts

### Infrastructure Layer Tests

- **Repository Tests**: Test repository implementations
- **Integration Tests**: Test with real databases or external services
- **Performance Tests**: Test data access performance

### Interface Layer Tests

- **Controller Tests**: Test HTTP handling and response formatting
- **E2E Tests**: Test complete user journeys
- **API Tests**: Test API contracts and documentation

## 🚀 Benefits of This Architecture

### 1. **Separation of Concerns**

- Each layer has a specific responsibility
- Changes in one layer don't affect others
- Easy to understand and maintain

### 2. **Testability**

- Each layer can be tested independently
- Easy to mock dependencies
- High test coverage achievable

### 3. **Flexibility**

- Easy to change implementations (e.g., switch databases)
- Easy to add new features
- Easy to refactor business logic

### 4. **Scalability**

- Can scale different layers independently
- Easy to add new bounded contexts
- Clear boundaries between modules

### 5. **Maintainability**

- Clear structure and organization
- Easy to onboard new developers
- Consistent patterns across the codebase

## 📚 Best Practices

### 1. **Dependency Direction**

- Dependencies always point inward
- Domain layer has no dependencies on outer layers
- Use interfaces to invert dependencies

### 2. **Error Handling**

- Use domain-specific exceptions
- Handle errors at appropriate layers
- Provide meaningful error messages

### 3. **Validation**

- Validate at multiple layers
- Use value objects for self-validation
- Provide clear validation error messages

### 4. **Logging**

- Log at appropriate levels
- Include relevant context
- Use structured logging

### 5. **Testing**

- Test each layer independently
- Use meaningful test names
- Follow AAA pattern (Arrange, Act, Assert)

## 🔄 Migration Guide

To add a new bounded context:

1. **Create Domain Layer**

   - Define entities and value objects
   - Create repository interfaces
   - Implement domain services

2. **Create Application Layer**

   - Define use cases
   - Create commands and queries
   - Define DTOs

3. **Create Infrastructure Layer**

   - Implement repositories
   - Add external service integrations

4. **Create Interface Layer**

   - Implement controllers
   - Define API routes

5. **Update DI Container**

   - Register new services
   - Wire up dependencies

6. **Add Tests**
   - Unit tests for domain logic
   - Integration tests for use cases
   - E2E tests for API endpoints

This architecture provides a solid foundation for building scalable, maintainable, and testable applications.
