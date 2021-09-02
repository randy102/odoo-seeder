type OptionExclude = 'getSeedData' | 'fieldMetadata' | 'generateORecord'

export type CleanOption<Option> = Omit<Option, OptionExclude>