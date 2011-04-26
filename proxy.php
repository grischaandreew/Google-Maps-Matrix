<?php

if( isset($_GET['u']) && stripos( parse_url( $_GET['u'], PHP_URL_HOST ), "google") !== false ) {
	$mem = new Memcache();
	$mem->addServer( '127.0.0.1' );
	$cid = "gmap." . md5($_GET['u']);
	
	if( isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] == $cid ) {
		header('HTTP/1.1 304 Not Modified');
		exit();
	}
	
	header( "Content-Type: image/jpeg" );
	header( "ETag: " . $cid );
	
	$data = $mem->get( $cid );
	if( $data ) {
		echo $data;
		exit();
	}
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $_GET['u'] );
	curl_setopt($ch, CURLOPT_TIMEOUT, 60 );
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1) ;
	
	$contents = curl_exec($ch);
	curl_close($ch);
	echo $contents;
	flush();
	ob_flush();
	$mem->set( $cid, $contents );
}
