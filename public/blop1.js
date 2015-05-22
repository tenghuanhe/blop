$(function () {
	
	var $window =		$(window);
	var $header =		$('.header');	
	var $idinput =		$('.idinput');
	var $maskpage =		$('.maskpage');
	var $realpage =		$('.realpage');
	var $ginput =		$('.ginput');
	var $sys_cuebar =	$('.sys_cuebar');
	var $usr_cuebar =	$('.usr_cuebar');
	var $logtips = 		$('.logtips');
	
	var socket_client = io();
	
	socket_client.io.reconnection(false);	// Disable reconnection
	
	var uid;
	$currinput = $idinput.focus();
	
	function setuid () {
		uid = clrinput($idinput.val().trim());
		
		if (uid) {
			$maskpage.fadeOut();
			$realpage.show();
			$currinput = $ginput.focus();
			
			socket_client.emit('addin', uid);
		}
	}
	
	function clrinput (input) {
		return $('<div/>').text(input).text();
	}

	// Keyboard events
	$window.keydown(function (event) {
		
		if (!(event.ctrlKey || event.metaKey || event.altKey)) {
			$currinput.focus();
		}
		
		if (event.which === 13) {
			
			if (uid)	{
				filp = clrinput($ginput.val().trim());
				$ginput.val('');
				if (filp) {
					$logtips.append("<p class='local'>" + uid + ':' + filp + '</p>');
					$logtips[0].scrollTop = $logtips[0].scrollHeight;
					$usr_cuebar.html('Your tips added.');
					socket_client.emit('filp', filp);
				}
			}
			
			else {
				setuid();
			}
		}
	});

	
	socket_client.on('login', function (data) {
		var welinfo = 'Welcome to blop, usr fr IP ' + data;
		$sys_cuebar.html(welinfo);
		$usr_cuebar.html('Looking strangers for you...');
	});
	
	socket_client.on('ctstgr', function (data) {
		$usr_cuebar.html(data.uid + ' from IP' + data.ip + ' is talking to you');
	});
	
	socket_client.on('nfilp', function (data) {
		$logtips.append('<p>' + data.uid + ':' + data.filp + '</p>');
		$logtips[0].scrollTop = $logtips[0].scrollHeight;
		$usr_cuebar.html('Osr tips added.');
	});	
	
	socket_client.on('stgrdl', function () {
		$usr_cuebar.html('Osr leaving, looking another stranger for you...');
	});
	

	socket_client.on('error', function (error) {
		errorinfo = 'Error: ' + error;
		$sys_cuebar.html(errorinfo);
	});
	
	socket_client.on('disconnect', function () {
		$sys_cuebar.html('The server has stopped running.');
	});
});