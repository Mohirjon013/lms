import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {

    @ApiProperty({example:'string'})
    @IsString()
    @IsNotEmpty()
    name!:string
}
