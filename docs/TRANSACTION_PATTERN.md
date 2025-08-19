# Transaction Pattern for Repository Layer

This document explains the new transaction pattern implemented in the repository layer that provides flexible transaction management for both SQL and NoSQL databases.

## Overview

The new transaction pattern moves transaction control from individual repositories to a centralized `TransactionManager` service. This allows the service layer to coordinate transactions across multiple repositories and provides better separation of concerns.

## Key Benefits

1. **Centralized Transaction Management**: All transaction logic is centralized in one place
2. **Cross-Repository Coordination**: Services can coordinate transactions across multiple repositories
3. **Database Agnostic**: Works with both SQL (PostgreSQL, MySQL) and NoSQL (MongoDB) databases
4. **Optional Transactions**: Operations can work with or without transactions
5. **Better Error Handling**: Centralized rollback logic in the service layer

## Architecture

```
Service Layer
    ↓
TransactionManager (begins/commits/rollbacks transactions)
    ↓
Repositories (accept optional transaction parameter)
    ↓
Database (SQL/NoSQL)
```

## Transaction Interface

```typescript
export interface Transaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  abort(): Promise<void>; // For NoSQL databases
  getId(): string;
}
```

## Transaction Manager Interface

```typescript
export interface TransactionManager {
  beginTransaction(): Promise<Transaction>;
  commitTransaction(transaction: Transaction): Promise<void>;
  rollbackTransaction(transaction: Transaction): Promise<void>;
  abortTransaction(transaction: Transaction): Promise<void>;
}
```

## Repository Interface

All repository methods now accept an optional `transaction` parameter:

```typescript
export interface UserRepository {
  findById(id: UserId, transaction?: Transaction): Promise<User | null>;
  save(user: User, transaction?: Transaction): Promise<void>;
  // ... other methods
}
```

## Usage Examples

### Simple Operation (No Transaction)

```typescript
// Simple read operation - no transaction needed
async getUserById(userId: UserId): Promise<User> {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw new UserNotFoundError(userId.getValue());
  }
  return user;
}
```

### Complex Operation (With Transaction)

```typescript
async transferUserData(fromUserId: UserId, toUserId: UserId): Promise<void> {
  let transaction: Transaction | undefined;

  try {
    // Begin transaction
    transaction = await this.transactionManager.beginTransaction();

    // Get both users within the transaction
    const fromUser = await this.userRepository.findById(fromUserId, transaction);
    const toUser = await this.userRepository.findById(toUserId, transaction);

    if (!fromUser || !toUser) {
      throw new Error("Users not found");
    }

    // Perform operations within transaction
    const updatedToUser = toUser.updateProfile(fromUser.getName());
    await this.userRepository.save(updatedToUser, transaction);
    await this.userRepository.delete(fromUserId, transaction);

    // Commit the transaction
    await this.transactionManager.commitTransaction(transaction);

  } catch (error) {
    // Rollback on any error
    if (transaction) {
      await this.transactionManager.rollbackTransaction(transaction);
    }
    throw error;
  }
}
```

### Conditional Transaction Usage

```typescript
async updateUserConditionally(
  userId: UserId,
  newName: UserName,
  useTransaction: boolean = false
): Promise<User> {
  if (!useTransaction) {
    // Simple operation without transaction
    const user = await this.userRepository.findById(userId);
    const updatedUser = user.updateProfile(newName);
    await this.userRepository.save(updatedUser);
    return updatedUser;
  }

  // Operation with transaction
  let transaction: Transaction | undefined;

  try {
    transaction = await this.transactionManager.beginTransaction();
    const user = await this.userRepository.findById(userId, transaction);
    const updatedUser = user.updateProfile(newName);
    await this.userRepository.save(updatedUser, transaction);
    await this.transactionManager.commitTransaction(transaction);
    return updatedUser;
  } catch (error) {
    if (transaction) {
      await this.transactionManager.rollbackTransaction(transaction);
    }
    throw error;
  }
}
```

## Database-Specific Implementations

### SQL Databases (Knex)

```typescript
export class KnexTransactionManager implements TransactionManager {
  constructor(private readonly knex: any) {}

  async beginTransaction(): Promise<Transaction> {
    const knexTransaction = await this.knex.transaction();

    const transaction: Transaction = {
      commit: async () => {
        await knexTransaction.commit();
      },
      rollback: async () => {
        await knexTransaction.rollback();
      },
      abort: async () => {
        await knexTransaction.rollback();
      },
      getId: () =>
        `knex_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Store the knex transaction for repository access
    (transaction as any).knexTransaction = knexTransaction;

    return transaction;
  }
}
```

### MongoDB

```typescript
export class MongoTransactionManager implements TransactionManager {
  constructor(private readonly mongoClient: any) {}

  async beginTransaction(): Promise<Transaction> {
    const session = this.mongoClient.startSession();
    await session.startTransaction();

    const transaction: Transaction = {
      commit: async () => {
        await session.commitTransaction();
        await session.endSession();
      },
      rollback: async () => {
        await session.abortTransaction();
        await session.endSession();
      },
      abort: async () => {
        await session.abortTransaction();
        await session.endSession();
      },
      getId: () =>
        `mongo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Store the mongo session for repository access
    (transaction as any).mongoSession = session;

    return transaction;
  }
}
```

## Testing

For testing, use the `InMemoryTransactionManager`:

```typescript
// In your test setup
const transactionManager = new InMemoryTransactionManager();
const userService = new UserService(userRepository, transactionManager);

// Test transaction behavior
await userService.transferUserData(userId1, userId2);
```

## Best Practices

1. **Always handle rollback**: Use try-catch blocks and ensure transactions are rolled back on errors
2. **Keep transactions short**: Don't hold transactions open for long periods
3. **Avoid nested transactions**: While supported, they can be complex and error-prone
4. **Use transactions only when needed**: Simple read operations don't need transactions
5. **Coordinate at service level**: Let the service layer manage transaction scope, not individual repositories

## Migration from Old Pattern

If you're migrating from the old internal transaction pattern:

1. Remove `beginTransaction()`, `commitTransaction()`, `rollbackTransaction()` from repositories
2. Add optional `transaction` parameter to all repository methods
3. Update services to use `TransactionManager`
4. Update tests to use `InMemoryTransactionManager`

## Future Enhancements

- **Transaction Timeout**: Add configurable timeout for long-running transactions
- **Distributed Transactions**: Support for distributed transaction scenarios
- **Transaction Logging**: Enhanced logging and monitoring of transaction lifecycle
- **Performance Metrics**: Track transaction performance and identify bottlenecks
