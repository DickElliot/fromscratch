import requests

cookies = {
    'dtid': '2:eZxBFAnOJIvVeT+u1u4riK8CobULTNnQ7CNiyMIthZ4239cUQlFo6mEfiHrfbxJd+Q22aFSXlzn5adbuby7azQNH4Ep+ns0dsHxWpYH1N20qQlH55rIuh50yW4B6Igojroc=',
    'ASP.NET_SessionId': 'e5tjopjul1cwvcpdyj25rrfm',
    'cw-laie': '0c6ee48e93bc4d648e45c8bc304d4ffc',
    'cw-arjshtsw': 'j54ef723fdbe84e1ba24206c6fe4c94d0jozkualjf',
    'AKA_A2': 'A',
    'akavpau_vpshop': '1625216363~id=3a51890348708c95f716e5867da598a9',
    'ARRAffinity': 'ef118ee760e0fe9344f9a8a27e58630725a431fea30d778e6489ecd95a2d4a5a',
    'ARRAffinitySameSite': 'ef118ee760e0fe9344f9a8a27e58630725a431fea30d778e6489ecd95a2d4a5a',
    'gig_canary': 'false',
    'gig_canary_ver': '12208-3-27086940',
    'ai_user': 'bCw26scV8JahwlBLQmVj6E|2021-07-02T08:28:31.744Z',
    'ai_sessioncw-': 'ANNerXhq8tq+NjWFrTEr9X|1625214512120|1625216064389',
    'gig_bootstrap_3_PWTq_MK-V930M4hDLpcL_qqUx224X_zPBEZ8yJeX45RHI-uKWYQC5QadqeRIfQKB': 'login_ver4',
}

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://shop.countdown.co.nz/shop/browse/fruit-veg',
    'Content-Type': 'application/json',
    'X-Requested-With': 'OnlineShopping.WebApp',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT',
    'Request-Id': '|1593c04f36974313b5c7073a1053b620.ac8869750b114ccc',
    'traceparent': '00-1593c04f36974313b5c7073a1053b620-ac8869750b114ccc-01',
    'DNT': '1',
    'Connection': 'keep-alive',
    'TE': 'Trailers',
}


def getProducts(page, section, subsection):
    section = 'Department;;' + section + ';false'
    subsection = 'Aisle;;' + subsection + ';false'
    params = (
        ('dasFilter', [section, subsection]),
        ('target', 'browse'),
        # Change these variables depending on category & page
        ('page', page),
        ('size', '120'),
    )
    response = requests.get('https://shop.countdown.co.nz/api/v1/products',
                            headers=headers, params=params, cookies=cookies)
    return(response.text)
