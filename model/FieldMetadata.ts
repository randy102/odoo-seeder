import { FieldConfig, FieldDefault } from './FieldDecorator';
import { SeedModel } from './SeedModel';


export class FieldMetadata {
  FieldClass: any
  defaultValue: FieldDefault
  key: string
  fieldName: string
  autoInit: boolean

  constructor(conf: FieldConfig, fieldName: string) {
    const { def, cls, key, auto } = conf || {}
    this.FieldClass = cls
    this.defaultValue = def
    this.key = key
    this.fieldName = fieldName
    this.autoInit = auto
  }

  isNormal(): boolean {
    return !this.FieldClass
  }

  isM2O(): boolean {
    return this.FieldClass && this.FieldClass.prototype instanceof SeedModel
  }

  isO2M(option): boolean {
    return this.FieldClass && Array.isArray(option[this.fieldName])
  }
}