### 安装vsftp，设置开机自启动
```shell
apt update
apt install vsftpd
systemctl start vsftpd
systemctl enable vsftpd
```
### 更改配置文件
```shell
vim /etc/vsftpd.conf


# vsftpd.conf

listen=NO
listen_ipv6=YES
anonymous_enable=NO
local_enable=YES
write_enable=YES
local_umask=022
dirmessage_enable=YES
xferlog_enable=YES
xferlog_std_format=YES
connect_from_port_20=YES
pam_service_name=ftp
# 被动模式
pasv_enable=YES
pasv_min_port=12000
pasv_max_port=12500
 
chroot_local_user=YES
chroot_list_enable=NO
allow_writeable_chroot=YES
local_root=/home/ftp
 
userlist_deny=NO
userlist_enable=YES
userlist_file=/etc/vsftpd.allowed_users
```

```shell
vim /etc/vsftpd.allowed_users

#vsftpd.allowed_users
ftpuser
```

### 新增ftp用户
```shell
adduser ftpuser
passwd ftpuser # 设置密码

mkdir -p /home/ftp
chown -R ftpuser:ftpuser /home/ftp
chmod -R 777 /home/ftp
```

### 重载配置
```shell
systemctl restart vsftpd
```
