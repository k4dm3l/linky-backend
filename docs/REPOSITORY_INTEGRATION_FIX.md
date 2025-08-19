# Repository Integration Fix

## Problem Description

The application was experiencing an issue where users could register successfully but would not appear in user listing endpoints. This was happening because:

1. **Two Separate Repositories**: The application uses two in-memory repositories:

   - `InMemoryUserCredentialsRepository` - Stores authentication data (email, hashed password, userId)
   - `InMemoryUserRepository` - Stores user profile data (id, email, name, createdAt)

2. **Incomplete Registration Process**: The registration process was only saving data to the credentials repository but not to the user repository.

3. **Separate Data Storage**: Each repository maintains its own Map instance, so data saved to one repository is not automatically available in the other.

## Root Cause

The `RegisterUserUseCase` was calling only:

```typescript
const userCredentials = await this.authDomainService.registerUser(
  email,
  password,
  userId,
);
```

This only saved the user credentials but did not create a user profile entry in the user repository.

## Solution

### 1. Updated RegisterUserUseCase

Modified the registration process to save data to both repositories:

```typescript
// Register user credentials
const userCredentials = await this.authDomainService.registerUser(
  email,
  password,
  userId,
);

// Create and save user profile with the same userId
const user = new User(new UserId(userId), email, name, new Date());

await this.userRepository.save(user);
```

### 2. Updated Dependency Injection

Modified the DI container to inject the user repository into the RegisterUserUseCase:

```typescript
container.registerSingleton(
  "registerUserUseCase",
  () =>
    new RegisterUserUseCase(
      container.resolve("authDomainService"),
      container.resolve("userRepository"), // Added this dependency
      container.resolve("logger"),
    ),
);
```

### 3. Data Consistency

Now when a user registers:

1. **Credentials Repository**: Stores authentication data (email, hashed password, userId)
2. **User Repository**: Stores profile data (id, email, name, createdAt)
3. **Same UserId**: Both repositories use the same userId, ensuring data consistency

## Testing

Created comprehensive E2E tests to verify the fix:

```typescript
// Test: Register → Login → Get Users → Get Specific User
it("should register a user and then be able to retrieve it from user endpoints", async () => {
  // 1. Register user
  // 2. Login to get token
  // 3. Get all users (should include registered user)
  // 4. Get specific user by ID
});
```

## Benefits

1. **Data Consistency**: User data is now consistently available across all endpoints
2. **Proper Separation of Concerns**: Authentication and profile data remain separate but linked
3. **Testable**: The fix includes comprehensive tests to prevent regression
4. **Scalable**: The pattern can be extended to other entities that need data in multiple repositories

## Architecture Impact

This fix maintains the clean architecture principles:

- **Domain Layer**: User entity and repositories remain unchanged
- **Application Layer**: RegisterUserUseCase now properly orchestrates both repositories
- **Infrastructure Layer**: In-memory repositories work as expected
- **Dependency Injection**: Properly configured to inject required dependencies

## Future Considerations

When moving to a real database:

1. **Transactions**: Ensure both repository operations happen in the same transaction
2. **Data Integrity**: Consider using foreign key constraints
3. **Caching**: Implement proper caching strategies for frequently accessed data
4. **Event Sourcing**: Consider using domain events for data synchronization
