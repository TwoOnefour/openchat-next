~~- 添加发送按钮快捷键 （手机回车和电脑回车都要适配~~
~~- 添加localstorage适配浏览器~~
~~- 添加新消息提醒~~
- 添加附件功能显示图片 电脑拖拽还有复制粘贴也要实现（可以接入twikoo接口
- 私人聊天室加密码
- markdown支持和链接渲染, 换行符支持（包括shift+enter换行）
- 由于KV和sql数据不能很好的同步，在高并发场景下，如同一时刻多人连续发送消息会出现kv往已经存在的消息写入，也会出现不可见现象，如下官方文档

```
Concurrent writes to the same key
Due to the eventually consistent nature of KV, concurrent writes to the same key can end up overwriting one another. It is a common pattern to write data from a single process with Wrangler or the API. This avoids competing concurrent writes because of the single stream. All data is still readily available within all Workers bound to the namespace.

If concurrent writes are made to the same key, the last write will take precedence.

Writes are immediately visible to other requests in the same global network location, but can take up to 60 seconds (or the value of the cacheTtl parameter of the get() or getWithMetadata() methods) to be visible in other parts of the world.

Refer to How KV works for more information on this topic.
```

特别的有
```
Workers KV has a maximum of 1 write to the same key per second. Writes made to the same key within 1 second will cause rate limiting (429) errors to be thrown.

You should not write more than once per second to the same key. Consider consolidating your writes to a key within a Worker invocation to a single write, or wait at least 1 second between writes.

```

解决方案为，自增1写入即可,官方示例如下

```ts
    const attemptWrite = async (i: number) => {
      try {
        await env. YOUR_KV_NAMESPACE.put(key, `Write attempt #${i}`);
        return { attempt: i, success: true };
      } catch (error) {
        // An error may be thrown if a write to the same key is made within 1 second with a message. For example:
        // error: {
        //  "message": "KV PUT failed: 429 Too Many Requests"
        // }

        return {
          attempt: i,
          success: false,
          error: { message: (error as Error).message },
        };
      }
    };
```

（或者并行写入？加锁？）

- 优化？刚进入则只加载最后十条消息，往上滑再动态加载消息

