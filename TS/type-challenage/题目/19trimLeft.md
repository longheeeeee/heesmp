### 题目

实现 `TrimLeft<T>` ，它接收确定的字符串类型并返回一个新的字符串，其中新返回的字符串删除了原字符串开头的空白字符串。

例如

```ts
type trimed = TrimLeft<'  Hello World  '> // 应推导出 'Hello World  '
```

```ts
type TrimLeft<S extends string> = S extends `${'\n' | '\t' | ' '}${infer Right}` ? TrimLeft<Right> : S
```


### 题目

实现`Trim<T>`，它接受一个明确的字符串类型，并返回一个新字符串，其中两端的空白符都已被删除。

例如

```ts
type trimed = Trim<'  Hello World  '> // expected to be 'Hello World'
```


```ts
type TrimLeft <S extends string> = S extends `${' ' | '\n' | '\t'}${infer Rest}` ? TrimLeft<Rest> : S
type TrimRight <S extends string> = S extends `${infer Rest}${' ' | '\n' | '\t'}` ? TrimRight<Rest> : S
type Trim<S extends string> = TrimLeft<TrimRight<S>>
```


### 题目

实现 `Replace<S, From, To>` 将字符串 `S` 中的第一个子字符串 `From` 替换为 `To` 。

例如

```ts
type replaced = Replace<'types are fun!', 'fun', 'awesome'> // 期望是 'types are awesome!'
```
```ts
type Replace<S extends string, From extends string, To extends string> = 
  From extends '' 
  ? S 
  : S extends `${infer L}${From}${infer R}` ? `${L}${To}${R}` : S
```


### 题目

实现 `ReplaceAll<S, From, To>` 将一个字符串 `S` 中的所有子字符串 `From` 替换为 `To`。

例如

```ts
type replaced = ReplaceAll<'t y p e s', ' ', ''> // 期望是 'types'
```

```ts
type ReplaceAll<S extends string, From extends string, To extends string> = 
  From extends '' 
  ? S 
  : S extends `${infer L}${From}${infer R}` ? `${L}${To}${ReplaceAll<R, From, To>}` : S
```
这里有个注意点是，L是不会存在From的，这里是从左到右匹配的？
