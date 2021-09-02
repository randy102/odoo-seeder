type SeedModelExclude =
  'generate'
  | 'getId'
  | 'get'
  | 'call'
  | 'write'
  | 'unlink'
  | 'archive'
  | 'getOption'
  | 'create'
  | 'ensureIdExisted'
  | 'setId'
  | 'getModelName'

export type CleanModel<Model> = Omit<Model, SeedModelExclude>