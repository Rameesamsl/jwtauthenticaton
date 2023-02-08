import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {StudentDataSource} from '../datasources';
import {Student, StudentRelations} from '../models';

export class StudentRepository extends DefaultCrudRepository<
  Student,
  typeof Student.prototype.id,
  StudentRelations
> {
  userCredentials: any;
  constructor(
    @inject('datasources.Student') dataSource: StudentDataSource,
  ) {
    super(Student, dataSource);
  }
}
