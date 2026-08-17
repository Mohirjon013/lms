import { NotFoundException } from "@nestjs/common";

export function NotFound(title:string):never{
    throw new NotFoundException(`${title} not found with this id`);
}