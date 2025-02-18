import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { AddUsersDto } from './dto/add-users.dto';
import { CreateChallengeDto } from './dto/create-challenge-dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Controller('challenges')
@ApiTags('Challenges')
export class ChallengesController {
    constructor(private readonly challengesService: ChallengesService) {}

    @Post()
    create(@Body() createChallengeDto: CreateChallengeDto) {
        return this.challengesService.create(createChallengeDto);
    }

    @Get()
    findAll() {
        return this.challengesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.challengesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateChallengeDto: UpdateChallengeDto) {
        return this.challengesService.update(+id, updateChallengeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.challengesService.remove(+id);
    }

    @Put(':id/user')
    addUser(@Param('id') id: string, @Body() addUserDto: AddUsersDto) {
        return this.challengesService.addUser(+id, addUserDto);
    }
}
