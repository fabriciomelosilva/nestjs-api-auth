import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { checkIfValidUUID } from 'src/shared/utils';
import { Repository } from 'typeorm';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './entities/item.entity';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item) private readonly repository: Repository<Item>,
  ) {}

  create(createItemDto: CreateItemDto) {
    const item = this.repository.create(createItemDto);
    return this.repository.save(item);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOne(id);
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.repository.preload({
      id: id,
      ...updateItemDto,
    });
    if (!item) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return this.repository.save(item);
  }

  async remove(id: string) {
    if (checkIfValidUUID(id)) {
      const item = await this.findOne(id);
      if (item) {
        return this.repository.remove(item);
      } else {
        throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException('Invalid Id', HttpStatus.BAD_REQUEST);
    }
  }
}
