# DB
indexedDB

## 安装
```js
npm i -S @stroll/db
```
## 使用
```js
// 声明DB操作实例
const testDB = new DB(
  'testDB', // 库名称
  { 
    testTable: { // 表名
      name: { // 可检索字段
        // unique: true, // 是否为主键， 默认主键为 _id
        // multiEntry: true, // true 为每个数组添加一个条目， false 添加一个包含数组的条目
      },
      age: {},
      as: {}
    }
  }
)

// 表实例
const testTable = testDB.table('testTable')

// 非关系型，可添加不同结构数据
// 表数据添加
testTable.add({ name: '123', age: 18, as: 'ss' })
testTable.add({ name: 'lu', age: 19, t: '**:**' })
// 多条表数据添加
testTable.adds([
  { name: 'li', age: 20, as: 'ss' },
  { name: 'wang', age: 21, t: '**:**' }
])

// 删除数据(参数 _id)
testTable.delete(_id)

// 修改数据
testTable.put({ _id: 1, name: 'liu', age: 18, as: '666' })

// 查询数据
testTable.get({ name: 'lu' })
// 查询数据(参数为查询条数)
testTable.gets(10)

// 获取表所有数据
// 依次返回数据 返回结果为 Object
testTable.find(data => {
  console.log(data)
})
// 返回全部数据 返回结果为 Array
testTable.findAll(arr => {
  console.log(arr)
})

// 在控制台打印(参数为打印条数)
userTable.console(100)

// 关闭数据库
testDB.close()

// 删除数据库 databaseName 可不传
testDB.delete(databaseName)

// 数据库状态
const DBState = testDB.getDBState()
```
