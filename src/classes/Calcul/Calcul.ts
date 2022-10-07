import { ICalcul } from '../../types/tables/calcul/ICalcul';
import { ApiError } from '../Errors/ApiError';
import { ErrorCode } from '../Errors/ErrorCode';

export interface ICalculSettings {
    firstNumber: number;
    secondNumber: number;
}

export class Calcul {
  firstNumber: number;
  secondNumber: number;

  constructor(firstNumber: number, secondNumber: number) {
    this.firstNumber = firstNumber;
    this.secondNumber = secondNumber;
  }

  getCalcul = () => {
    return this.firstNumber * this.secondNumber;
  }

}

