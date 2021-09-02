import { SeedOption } from './SeedOption';
import { clone, OdooRPC } from '../helper';
import { IModel } from './IModel';
import { CleanOption } from '../type/private';

export type ModelConfig = {
  modelName: string
  optionClass: any
}


export abstract class SeedModel<Option extends SeedOption> implements IModel {
  protected readonly rpc: OdooRPC = OdooRPC.getInstance()
  protected MODEL: string
  protected ID: number
  protected OptionClass: any
  protected option: Option


   constructor(options?: Partial<CleanOption<Option>> | number) {
    this.setupModel()
    this.setupOption(options)
  }

  private setupOption(option) {
    if (Number.isInteger(option)) {
      this.setId(option)
    } else {
      this.option = new this.OptionClass(option)
    }
  }

  private setupModel() {
    const { modelName, optionClass } = this.getModelConfig()
    this.MODEL = modelName
    this.OptionClass = optionClass
  }

  protected abstract getModelConfig(): ModelConfig

  protected async beforeGenerate(option: Option) {
  }

  protected async afterGenerate(option: Option, id: number) {
  }

  async generate(): Promise<number> {
    const id = this.getId()
    if (id) return id
    try {
      await this.option.generateORecord()
      await this.beforeGenerate(this.option)
      const data = this.option.getSeedData()
      const createdId = await this._create(data)
      this.setId(createdId)
      await this.afterGenerate(clone(this.option), createdId)
      return createdId
    } catch (err) {
      console.log('An error occurs during model generating: ', { err })
    }
  }

  protected async shouldCleanup(option: Option): Promise<boolean> {
    return true
  }

  async get(fields: string[]): Promise<any> {
    this.ensureIdExisted()
    const [data] = await this.rpc.read(this.getModelName(), [this.getId()], fields)
    return data
  }

  call(method: string, ...args): Promise<any> {
    this.ensureIdExisted()
    return this.rpc.call(this.getModelName(), method, this.getId(), ...args)
  }

  write(method: string, val: object): Promise<void> {
    this.ensureIdExisted()
    return this.rpc.write(this.getModelName(), this.getId(), val)
  }

  unlink(): Promise<void> {
    this.ensureIdExisted()
    return this.rpc.unlink(this.getModelName(), this.getId())
  }

  archive(): Promise<void> {
    this.ensureIdExisted()
    return this.rpc.archive(this.getModelName(), this.getId())
  }

  async getOption(): Promise<Option>{
    return clone(this.option)
  }

  private async _create(val: object): Promise<number> {
    const id = this.getId()
    if (id) return id
    return this.create(val, clone(this.option))
  }

  create(val: object, option: Option): Promise<number> {
    return this.rpc.create(this.getModelName(), val)
  }

  ensureIdExisted() {
    if (!this.getId()) throw Error('ID undefined. SeedModel is not generated.')
  }

  getId(): number {
    return this.ID
  }

  setId(id: number) {
    if (this.getId()) return
    this.ID = id
  }

  getModelName(): string {
    return this.MODEL
  }

}