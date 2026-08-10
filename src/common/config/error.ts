import { NotFoundException } from "@nestjs/common";

export function NotFound(title:string){
    throw new NotFoundException(`${title} not found with this id`)
}