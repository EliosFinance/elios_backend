import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnterpriseDto {
    @IsNotEmpty({ message: 'Enterprise name is required' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Enterprise description is required' })
    @IsString()
    description: string;
}
