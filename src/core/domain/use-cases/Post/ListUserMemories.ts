import { Memory } from "../../entities/Memory";
import { IMemoryRepository } from "../../repositories/IMemoryRepository";

export class ListUserMemories {
  constructor(private readonly memoryRepository: IMemoryRepository) {}

  async execute(params: { userId: string }): Promise<Memory[]> {
    return this.memoryRepository.findByUserId(params.userId);
  }
}
