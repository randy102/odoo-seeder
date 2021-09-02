import { SeedModel } from './SeedModel';
import { FieldMetadata } from './FieldMetadata';
import { FieldDefault } from './FieldDecorator';
import { clone } from '../helper';

export class SeedOption {
  fieldMetadata: FieldMetadata[]

  constructor(option?: any) {
    Object.assign(this, option)
    if (this.fieldMetadata) {
      this.initOne2ManyRecord()
      this.initMany2OneRecord()
    }
  }

  private initOne2ManyRecord() {
    for (const field of this.fieldMetadata) {
      if (field.isO2M(this)) {
        const { FieldClass: OptionClass, fieldName } = field
        this[fieldName] = this[fieldName].map(f => new OptionClass(f))
      }
    }
  }

  private initMany2OneRecord() {
    for (const field of this.fieldMetadata) {
      const { FieldClass: ModelClass, defaultValue: rawDefaultVal, fieldName, autoInit } = field
      const defaultValue = this.getDefaultValue(rawDefaultVal)

      if (field.isNormal() && !this[fieldName] && defaultValue) {
        this[fieldName] = defaultValue
      }

      else if (field.isM2O()) {
        if (!this[fieldName] && autoInit) {
          this[fieldName] = new ModelClass(defaultValue)
        } else if (Number.isInteger(this[fieldName]) || !(this[fieldName] instanceof ModelClass)) {
          this[fieldName] = new ModelClass(this[fieldName])
        }
      }

      else if (field.isO2M(this)) {
        this[fieldName].forEach(f => (f as SeedOption).initMany2OneRecord())
      }
    }
  }

  async generateORecord() {
    if (!this.fieldMetadata) return
    for (const field of this.fieldMetadata) {
      const { fieldName } = field

      if (field.isM2O() && this[fieldName]) {
        await (this[fieldName] as SeedModel<any>).generate()
      }

      else if (field.isO2M(this)) {
        for (const opt of this[fieldName]) {
          await (opt as SeedOption).generateORecord()
        }
      }
    }
  }

  async cleanupORecord() {
    if (!this.fieldMetadata) return
    for (const field of this.fieldMetadata) {
      const { fieldName } = field
      if (field.isM2O()) {
        await (this[fieldName] as SeedModel<any>).cleanup()
      } else if (field.isO2M(this)) {
        for (const opt of this[fieldName]) {
          await (opt as SeedOption).cleanupORecord()
        }
      }
    }
  }

  getSeedData() {
    const data = {}
    for (const field of this.fieldMetadata) {
      const { key, fieldName } = field

      if (field.isNormal()) {
        data[key] = this[fieldName]
      }
      else if (field.isO2M(this)) {
        data[key] = SeedOption.formatO2MData(this[fieldName].map(f => f.getSeedData()))
      }
      else if (field.isM2O() && this[fieldName]){
        data[key] = (this[fieldName] as SeedModel<any>).getId()
      }
    }
    return data
  }

  private static formatO2MData(record: any[]) {
    return record.map(r => [0, 0, r])
  }

  private getDefaultValue(def: FieldDefault) {
    if (typeof def === 'function') {
      return def(clone(this))
    }
    return def
  }


}