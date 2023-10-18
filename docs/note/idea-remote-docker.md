# IDEA远程连接docker

## docker CA认证
1. 创建ca文件夹，存放CA私钥和公钥
```shell
mkdir -p /usr/local/ca
cd /usr/local/ca/
```
2. 生成server-key.pem
```shell
# 输入两次相同的密码
openssl genrsa -aes256 -out ca-key.pem 4096
# 依次输入密码、国家、省、市、组织名称等
openssl req -new -x509 -days 365 -key ca-key.pem -sha256 -out ca.pem
# 生成server-key.pem
openssl genrsa -out server-key.pem 4096
```
3. 把下面的ip换成远程服务器的ip
```shell
openssl req -subj "/CN=43.139.22.143" -sha256 -new -key server-key.pem -out server.csr
```
4. 配置白名单
```shell
echo subjectAltName = IP:43.139.22.143,IP:0.0.0.0 >> extfile.cnf
```
5. 将Docker守护程序密钥的扩展使用属性设置为仅用于服务器身份验证
```shell
echo extendedKeyUsage = serverAuth >> extfile.cnf
```
6. 执行命令，并输入之前设置的密码，生成签名证书
```shell
openssl x509 -req -days 365 -sha256 -in server.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out server-cert.pem -extfile extfile.cnf
```
7. 生成客户端的key.pem，到时候把生成好的几个公钥私钥拷出去即可
```shell
openssl genrsa -out key.pem 4096
openssl req -subj '/CN=client' -new -key key.pem -out client.csr
echo extendedKeyUsage = clientAuth >> extfile.cnf
```
8. 生成cert.pem,需要输入前面设置的密码，生成签名证书
```shell
openssl x509 -req -days 365 -sha256 -in client.csr -CA ca.pem -CAkey ca-key.pem -CAcreateserial -out cert.pem -extfile extfile.cnf
```
9.  删除不需要的文件，两个证书签名请求
```shell
rm -v client.csr server.csr
```
10. 修改权限并复制到指定目录
```shell
chmod -v 0400 ca-key.pem key.pem server-key.pem
chmod -v 0444 ca.pem server-cert.pem cert.pem
cp server-*.pem  /etc/docker/
cp ca.pem /etc/docker/
```
11. 重启docker