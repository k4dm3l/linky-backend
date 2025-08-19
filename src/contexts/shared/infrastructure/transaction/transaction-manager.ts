import { Transaction } from "@/contexts/users/domain/repositories/user-repository";

// Base transaction manager interface
export interface TransactionManager {
  beginTransaction(): Promise<Transaction>;
  commitTransaction(transaction: Transaction): Promise<void>;
  rollbackTransaction(transaction: Transaction): Promise<void>;
  abortTransaction(transaction: Transaction): Promise<void>;
}

// In-memory transaction manager for testing
export class InMemoryTransactionManager implements TransactionManager {
  private activeTransactions = new Map<string, Transaction>();

  async beginTransaction(): Promise<Transaction> {
    // Generate transaction ID once
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // For in-memory, we create a mock transaction that properly tracks state
    const transaction: Transaction = {
      commit: async () => {
        // Mark as committed but don't delete yet
        (transaction as any).isCommitted = true;
      },
      rollback: async () => {
        // Mark as rolled back but don't delete yet
        (transaction as any).isRolledBack = true;
      },
      abort: async () => {
        // Same as rollback for in-memory
        await this.rollbackTransaction(transaction);
      },
      getId: () => transactionId,
    };

    // Initialize transaction state
    (transaction as any).isCommitted = false;
    (transaction as any).isRolledBack = false;

    this.activeTransactions.set(transactionId, transaction);
    return transaction;
  }

  async commitTransaction(transaction: Transaction): Promise<void> {
    if (!this.activeTransactions.has(transaction.getId())) {
      throw new Error(`Transaction ${transaction.getId()} not found`);
    }

    const tx = this.activeTransactions.get(transaction.getId())!;
    if ((tx as any).isCommitted || (tx as any).isRolledBack) {
      throw new Error(`Transaction ${transaction.getId()} already completed`);
    }

    await transaction.commit();
    // Keep transaction in map for a short time to allow cleanup
    setTimeout(() => {
      this.activeTransactions.delete(transaction.getId());
    }, 100);
  }

  async rollbackTransaction(transaction: Transaction): Promise<void> {
    if (!this.activeTransactions.has(transaction.getId())) {
      throw new Error(`Transaction ${transaction.getId()} not found`);
    }

    const tx = this.activeTransactions.get(transaction.getId())!;
    if ((tx as any).isCommitted || (tx as any).isRolledBack) {
      throw new Error(`Transaction ${transaction.getId()} already completed`);
    }

    await transaction.rollback();
    // Keep transaction in map for a short time to allow cleanup
    setTimeout(() => {
      this.activeTransactions.delete(transaction.getId());
    }, 100);
  }

  async abortTransaction(transaction: Transaction): Promise<void> {
    await this.rollbackTransaction(transaction);
  }

  // Helper method for testing
  clear(): void {
    this.activeTransactions.clear();
  }

  // Helper method to check transaction status
  getTransactionStatus(
    transactionId: string,
  ): "active" | "committed" | "rolledback" | "not_found" {
    const tx = this.activeTransactions.get(transactionId);
    if (!tx) return "not_found";
    if ((tx as any).isCommitted) return "committed";
    if ((tx as any).isRolledBack) return "rolledback";
    return "active";
  }
}

// SQL transaction manager using Knex
export class KnexTransactionManager implements TransactionManager {
  constructor(private readonly knex: any) {}

  async beginTransaction(): Promise<Transaction> {
    const knexTransaction = await this.knex.transaction();

    // Generate transaction ID once
    const transactionId = `knex_tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

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
      getId: () => transactionId,
    };

    // Store the knex transaction for repository access
    (transaction as any).knexTransaction = knexTransaction;

    return transaction;
  }

  async commitTransaction(transaction: Transaction): Promise<void> {
    await transaction.commit();
  }

  async rollbackTransaction(transaction: Transaction): Promise<void> {
    await transaction.rollback();
  }

  async abortTransaction(transaction: Transaction): Promise<void> {
    await transaction.abort();
  }

  // Helper method to get the underlying knex transaction
  getKnexTransaction(transaction: Transaction): any {
    return (transaction as any).knexTransaction;
  }
}

// MongoDB transaction manager
export class MongoTransactionManager implements TransactionManager {
  constructor(private readonly mongoClient: any) {}

  async beginTransaction(): Promise<Transaction> {
    const session = this.mongoClient.startSession();
    await session.startTransaction();

    // Generate transaction ID once
    const transactionId = `mongo_tx_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

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
      getId: () => transactionId,
    };

    // Store the mongo session for repository access
    (transaction as any).mongoSession = session;

    return transaction;
  }

  async commitTransaction(transaction: Transaction): Promise<void> {
    await transaction.commit();
  }

  async rollbackTransaction(transaction: Transaction): Promise<void> {
    await transaction.rollback();
  }

  async abortTransaction(transaction: Transaction): Promise<void> {
    await transaction.abort();
  }

  // Helper method to get the underlying mongo session
  getMongoSession(transaction: Transaction): any {
    return (transaction as any).mongoSession;
  }
}
