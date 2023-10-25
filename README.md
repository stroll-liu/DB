# [来源](https://github.com/erikolson186/zangodb)
## [完整文档](/docs/index.html)
```javascript
let db = new webdb.Db('mydb', { people: ['age'] });
let people = db.collection('people');

let docs = [
    { name: 'Frank', age: 20 },
    { name: 'Thomas', age: 33 },
    { name: 'Todd', age: 33 },
    { name: 'John', age: 28 },
    { name: 'Peter', age: 33 },
    { name: 'George', age: 28 }
];

people.insert(docs).then(() => {
    return people.find({
        name: { $ne: 'John' },
        age: { $gt: 20 }
    }).group({
        _id: { age: '$age' },
        count: { $sum: 1 }
    }).project({
        _id: 0,
        age: '$_id.age'
    }).sort({
        age: -1
    }).forEach(doc => console.log('doc:', doc));
}).catch(error => console.error(error));
```
## Document Language Operators

### Filter Operators

The following filter operators are supported: `$and`, `$or`, `$not`, `$nor`, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$elemMatch`, `$regex`, and `$exists`.

### Expression Operators

Expression operators can be used in combination with the group and projection operators.

The following expression operators are supported: `$literal`, `$add`, `$subtract`, `$multiply`, `$divide`, `$mod`, `$abs`, `$ceil`, `$floor`, `$ln`, `$log10`, `$pow`, `$sqrt`, `$trunc`, `$concat`, `$toLower`, `$toUpper`, `$concatArrays`, `$dayOfMonth`, `$year`, `$month`, `$hour`, `$minute`, `$second`, and `$millisecond`.

### Update Operators

The following update operators are supported: `$set`, `$unset`, `$rename`, `$inc`, `$mul`, `$min`, `$max`, `$push`, `$pop`, `$pullAll`, `$pull`, and `$addToSet`.

### Group Operators

The following group operators are supported: `$sum`, `$avg`, `$min`, `$max`, `$push`, and `$addToSet`.

## Aggregation Pipeline Stages

支持以下聚合管道阶段：“$match”、“$project”、“$group”、“$unwind”、“$sort”、“$skip”和“$limit”。
