// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';

import TranscationsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transcationsRepository = getCustomRepository(TranscationsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transcationsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Você não tem saldo');
    }

    // Verificar se a categoria já existe
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    const transaction = transcationsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transcationsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
