

import {authenticate, TokenService} from '@loopback/authentication';
import {
Credentials,
MyUserService,
TokenServiceBindings,

UserRepository,
UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model, property, repository} from '@loopback/repository';
import {
get,
getModelSchemaRef,
post,
requestBody,
SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import _ from 'lodash';
import { Student } from '../models';
import { StudentRepository } from '../repositories';

@model()
export class NewUserRequest extends Student {
@property({
type: 'string',
required: true,
})
password: string;
}

const CredentialsSchema: SchemaObject = {
type: 'object',
required: ['email', 'password'],
properties: {
email: {
  type: 'string',
  format: 'email',
},
password: {
  type: 'string',
  minLength: 8,
},

},
};

export const CredentialsRequestBody = {
description: 'The input of login function',
required: true,
content: {
'application/json': {schema: CredentialsSchema},
},
};

export class UserController {
constructor(
@inject(TokenServiceBindings.TOKEN_SERVICE)
public jwtService: TokenService,
@inject(UserServiceBindings.USER_SERVICE)
public userService: MyUserService,

@repository(UserRepository) protected userRepository: UserRepository,
@repository(StudentRepository) protected studentRepository: StudentRepository,
) {}

@post('/users/login', {
responses: {
  '200': {
    description: 'Token',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
          },
        },
      },
    },
  },
},
})
async login(
@requestBody(CredentialsRequestBody) credentials: Credentials,
): Promise<{token: string}> {
  console.log(credentials)
// ensure the user exists, and the password is correct
const creden = await this.userService.verifyCredentials(credentials);
console.log(creden)
// convert a User object into a UserProfile object (reduced set of properties)
const userProfile = this.userService.convertToUserProfile(creden);
console.log(userProfile)
// create a JSON Web Token based on the user profile
const token = await this.jwtService.generateToken(userProfile);
return {token};
}

@authenticate('jwt')
@get('/whoAmI', {
responses: {
  '200': {
    description: 'Return current user',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  },
},
})
async whoAmI(
@inject(SecurityBindings.USER)
currentUserProfile: UserProfile,
): Promise<string> {
return currentUserProfile[securityId];
}

@post('/signup', {
responses: {
  '200': {
    description: 'Student',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Student,
        },
      },
    },
  },
},
})
async signUp(
@requestBody({
  content: {
    'application/json': {
      schema: getModelSchemaRef(NewUserRequest, {
        title: 'NewUser',
      }),
    },
  },
})
newUserRequest: Student,
): Promise<Student> {
const password = await hash(newUserRequest.password, await genSalt());
newUserRequest.password=password

await this.studentRepository.create(newUserRequest);

return newUserRequest;
}
}

