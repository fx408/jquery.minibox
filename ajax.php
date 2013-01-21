<?php
sleep(1);
$error = rand(0,1);
$msg = (isset($_POST['content']) ? $_POST['content'] : '提交信息!');
$msg .= sprintf(' - %s', ($error == 0 ? '正确' : '错误'));

echo json_encode(array('error'=>$error, 'msg'=>$msg));
?>