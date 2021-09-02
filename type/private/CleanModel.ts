type SeedModelExclude =
  'generate'
  | 'getId'
  | 'cleanup'
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