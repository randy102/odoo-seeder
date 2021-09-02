import { CleanModel, CleanOption } from '../private';

export type ORecord<Model, Option = any> = number | CleanModel<Model> | Partial<CleanOption<Option>>

export type MRecord<Option> = number[] | Partial<CleanOption<Option>>[]
