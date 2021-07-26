import requests

cookies = {
    'dtid': '2:eZxBFAnOJIvVeT+u1u4riK8CobULTNnQ7CNiyMIthZ4239cUQlFo6mEfiHrfbxJd+Q22aFSXlzn5adbuby7azQNH4Ep+ns0dsHxWpYH1N20qQlH55rIuh50yW4B6Igojroc=',
    'ASP.NET_SessionId': 'e5tjopjul1cwvcpdyj25rrfm',
    'cw-laie': '0c6ee48e93bc4d648e45c8bc304d4ffc',
    'cw-arjshtsw': 'j54ef723fdbe84e1ba24206c6fe4c94d0jozkualjf',
    'akavpau_vpshop': '1625218883~id=ed67eee64a05757bb48c78e7c8f7994e',
    'ARRAffinity': 'ef118ee760e0fe9344f9a8a27e58630725a431fea30d778e6489ecd95a2d4a5a',
    'ARRAffinitySameSite': 'ef118ee760e0fe9344f9a8a27e58630725a431fea30d778e6489ecd95a2d4a5a',
    'gig_canary': 'false',
    'gig_canary_ver': '12208-3-27086970',
    'ai_user': 'bCw26scV8JahwlBLQmVj6E|2021-07-02T08:28:31.744Z',
    'ai_sessioncw-': 'ANNerXhq8tq+NjWFrTEr9X|1625214512120|1625218582924',
    'gig_bootstrap_3_PWTq_MK-V930M4hDLpcL_qqUx224X_zPBEZ8yJeX45RHI-uKWYQC5QadqeRIfQKB': 'login_ver4',
    'cw-lrkswrdjp': 'dm-Pickup,f-9412,a-619,s-10339',
    'AKA_A2': 'A',
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://shop.countdown.co.nz/bookatimeslot(modal:change-pick-up-store)',
    'Content-Type': 'application/json',
    'X-Requested-With': 'OnlineShopping.WebApp',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
    'Request-Id': '|3131ff5d74014d0091b0a5a750ad75d3.f6a470c264d04e76',
    'traceparent': '00-3131ff5d74014d0091b0a5a750ad75d3-f6a470c264d04e76-01',
    'DNT': '1',
    'Connection': 'keep-alive',
    'TE': 'Trailers',
}


def getSupermarkets():
    response = requests.get(
        'https://shop.countdown.co.nz/api/v1/addresses/pickup-addresses', headers=headers, cookies=cookies
    )
    return response.json
