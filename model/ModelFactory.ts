import { IModel } from '../index';

export abstract class ModelFactory<Option> {
  protected modelList: { [key: string]: IModel } = {}

  constructor(options: { [key: string]: Partial<Option> }) {
    const ModelClass = this.getModelClass()
    const modelList = {}
    for (const [key, option] of Object.entries(options)) {
      modelList[key] = new ModelClass(option)
    }
    this.modelList = modelList
  }

  abstract getModelClass()

  async generate(): Promise<number[]> {
    let createdIds = []
    for(const mock of Object.values(this.modelList)){
      const created = await mock.generate()
      createdIds.push(created)
    }
    return createdIds
  }

  cleanup(): Promise<void[]> {
    return Promise.all(Object.values(this.modelList)?.map(mock => mock.cleanup(false)))
  }

  length(): number {
    return Object.keys(this.modelList).length
  }

  getModel(key: string): IModel {
    if (key in this.modelList)
      return this.modelList[key]
    return null
  }

  getModelById(id: number): IModel {
    return Object.values(this.modelList).find(mock => mock.getId() == id)
  }
}