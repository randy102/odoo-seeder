type OptionExclude = 'getSeedData' | 'cleanupORecord' | 'fieldMetadata' | 'generateORecord'

export type CleanOption<Option> = Omit<Option, OptionExclude>