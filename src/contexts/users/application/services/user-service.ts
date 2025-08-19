import { User } from "@/contexts/users/domain/entities/user";
import { UserId } from "@/contexts/users/domain/value-objects/user-id";
import { Email } from "@/contexts/users/domain/value-objects/email";
import { UserName } from "@/contexts/users/domain/value-objects/user-name";
import { UserRepository, Transaction } from "@/contexts/users/domain/repositories/user-repository";
import { TransactionManager } from "@/contexts/shared/infrastructure/transaction/transaction-manager";
import { UserAlreadyExistsError, UserNotFoundError } from "@/contexts/users/domain/exceptions/user-exceptions";

export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  // Example of a simple operation without transaction
  async getUserById(userId: UserId): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId.getValue());
    }
    return user;
  }

  // Example of an operation that requires transaction coordination
  async createUserWithProfile(email: Email, name: UserName): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError(email.getValue());
    }

    // Create new user with generated ID
    const user = new User(
      UserId.generate(),
      email,
      name,
      new Date()
    );

    // Save to repository
    await this.userRepository.save(user);
    return user;
  }

  // Example of a complex operation that requires transaction coordination
  async transferUserData(fromUserId: UserId, toUserId: UserId): Promise<void> {
    let transaction: Transaction | undefined;

    try {
      // Begin transaction
      transaction = await this.transactionManager.beginTransaction();

      // Get both users within the transaction
      const fromUser = await this.userRepository.findById(fromUserId, transaction);
      const toUser = await this.userRepository.findById(toUserId, transaction);

      if (!fromUser) {
        throw new UserNotFoundError(fromUserId.getValue());
      }
      if (!toUser) {
        throw new UserNotFoundError(toUserId.getValue());
      }

      // Perform data transfer operations within the transaction
      // This could involve multiple repository operations
      const updatedToUser = toUser.updateProfile(fromUser.getName());
      await this.userRepository.save(updatedToUser, transaction);

      // Delete the source user
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

  // Example of bulk operations with transaction
  async bulkUpdateUsers(userUpdates: Array<{ id: UserId; name: UserName }>): Promise<void> {
    let transaction: Transaction | undefined;

    try {
      transaction = await this.transactionManager.beginTransaction();

      for (const update of userUpdates) {
        const user = await this.userRepository.findById(update.id, transaction);
        if (!user) {
          throw new UserNotFoundError(update.id.getValue());
        }

        const updatedUser = user.updateProfile(update.name);
        await this.userRepository.save(updatedUser, transaction);
      }

      await this.transactionManager.commitTransaction(transaction);

    } catch (error) {
      if (transaction) {
        await this.transactionManager.rollbackTransaction(transaction);
      }
      throw error;
    }
  }

  // Example of conditional transaction usage
  async updateUserConditionally(
    userId: UserId, 
    newName: UserName, 
    useTransaction: boolean = false
  ): Promise<User> {
    if (!useTransaction) {
      // Simple operation without transaction
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError(userId.getValue());
      }

      const updatedUser = user.updateProfile(newName);
      await this.userRepository.save(updatedUser);
      return updatedUser;
    }

    // Operation with transaction
    let transaction: Transaction | undefined;

    try {
      transaction = await this.transactionManager.beginTransaction();

      const user = await this.userRepository.findById(userId, transaction);
      if (!user) {
        throw new UserNotFoundError(userId.getValue());
      }

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

  // Example of nested transaction handling (though generally not recommended)
  async complexOperationWithNestedTransactions(): Promise<void> {
    const outerTransaction = await this.transactionManager.beginTransaction();

    try {
      // First operation in outer transaction
      const user1 = await this.userRepository.findById(UserId.generate(), outerTransaction);
      
      // Nested transaction (this would typically be handled differently in real databases)
      const innerTransaction = await this.transactionManager.beginTransaction();
      
      try {
        const user2 = await this.userRepository.findById(UserId.generate(), innerTransaction);
        await this.transactionManager.commitTransaction(innerTransaction);
      } catch (error) {
        await this.transactionManager.rollbackTransaction(innerTransaction);
        throw error;
      }

      await this.transactionManager.commitTransaction(outerTransaction);

    } catch (error) {
      await this.transactionManager.rollbackTransaction(outerTransaction);
      throw error;
    }
  }
} 