import { inject } from "@loopback/core";
import { compare, genSalt, hash } from "bcryptjs";

export class Passwordhashing{
    @inject('rounds')
    public readonly rounds:number

    async passwordhash(password:string){
  const salt = await genSalt(this.rounds)
  return await hash(password,salt)
    }

    async passwordcompare(storedpass:string,providedpass:string){
     const pass = compare(providedpass,storedpass)
     return pass
    }
}