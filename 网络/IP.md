# ip包发送过程
1. 封装ip包
2. 根据当前ip和子网掩码，判断目标ip是否在同一个子网，是则直接发送，不是则发送至默认网关
3. 知道目标ip地址后，查询本地arp缓存来尝试获取目标ip对应的mac地址，如果没有缓存，则发起arp广播，目标机子回应后填写对应mac地址到数据包上并发送
4. 网关收到数据包后，根据本地路由表，判断最接近目标ip的地址并发送，如果都不匹配则发送默认网关
