/** Types generated for queries found in "app/queries/sample.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'SelectOne' parameters type */
export type ISelectOneParams = void;

/** 'SelectOne' return type */
export interface ISelectOneResult {
  one: number | null;
}

/** 'SelectOne' query type */
export interface ISelectOneQuery {
  params: ISelectOneParams;
  result: ISelectOneResult;
}

const selectOneIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT 1 as one"};

/**
 * Query generated from SQL:
 * ```
 * SELECT 1 as one
 * ```
 */
export const selectOne = new PreparedQuery<ISelectOneParams,ISelectOneResult>(selectOneIR);


