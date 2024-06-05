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
## 运算符

### 过滤器运算符

支持以下过滤器运算符: `$and`, `$or`, `$not`, `$nor`, `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$elemMatch`, `$regex`, and `$exists`.

### 表达式运算符

表达式运算符可以与群运算符和投影运算符结合使用。

支持以下表达式运算符: `$literal`, `$add`, `$subtract`, `$multiply`, `$divide`, `$mod`, `$abs`, `$ceil`, `$floor`, `$ln`, `$log10`, `$pow`, `$sqrt`, `$trunc`, `$concat`, `$toLower`, `$toUpper`, `$concatArrays`, `$dayOfMonth`, `$year`, `$month`, `$hour`, `$minute`, `$second`, and `$millisecond`.

### 更新运算符

支持以下更新运算符: `$set`, `$unset`, `$rename`, `$inc`, `$mul`, `$min`, `$max`, `$push`, `$pop`, `$pullAll`, `$pull`, and `$addToSet`.

### 组运算符

支持以下组运算符：: `$sum`, `$avg`, `$min`, `$max`, `$push`, and `$addToSet`.

## 聚合管道阶段

支持以下聚合管道阶段：“$match”、“$project”、“$group”、“$unwind”、“$sort”、“$skip”和“$limit”。
