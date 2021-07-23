import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  transform(value: Array<any>, field: string): Array<any> {
    const groupedObj = value.reduce((prev, cur) => {
      // const curField = cur['lookups']['created']; // cur[field];
      const fields = field.split('.');
      let curField = cur;
      fields.forEach((fieldItem) => {
        curField = curField[fieldItem];
      });
      if (!prev[curField]) {
        prev[curField] = [cur];
      } else {
        prev[curField].push(cur);
      }
      return prev;
    }, {});
    const returnObj = Object.keys(groupedObj).map(key => ({ key, value: groupedObj[key] }));
    return returnObj;
  }
}
