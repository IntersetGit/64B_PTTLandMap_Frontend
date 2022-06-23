import Document, { Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {

  render() {
    return (
      <html>
        <Head>
          <link rel="shortcut icon" href="/assets/images/PTT-herder.png" />
          <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
          <link rel="stylesheet" href="/assets/css/font-awesome.min.css" />
          <link rel="stylesheet" href="/assets/css/line-awesome.min.css" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300&display=swap" rel="stylesheet" />
          <link rel="icon" type="image/png" href="/assets/images/PTT-herder.png"></link>
          {/* <script src='https://maps.google.com/maps/api/js?key=AIzaSyCFI5ESCo1VI27tyX8fWdmBC-MQrKX3FEk&libraries=drawing,places,weekly,geometry&language=th&region=TH' async defer></script> */}
          <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCFI5ESCo1VI27tyX8fWdmBC-MQrKX3FEk&libraries=drawing,places,weekly,geometry&language=th&region=TH" async defer></script>

        </Head>
        <body>
          <Main />
          <div id="app"></div>
          <NextScript />
          <script
            src="https://code.jquery.com/jquery-3.6.0.js"
            integrity="sha256-H+K7U5CnXl1h5ywQfKtSj8PCmoN9aaq30gDh27Xc0jk="
            crossorigin="anonymous"></script>
          <script src="/assets/js/popper.min.js"></script>
          <script src="/assets/js/bootstrap.min.js"></script>
          <script src="/assets/js/jquery.slimscroll.min.js"></script>
          <script src="/assets/js/jscoord-1.1.1.js"></script>
          <script src="/assets/js/app.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/split.js/1.5.11/split.min.js" async defer></script>

          <script defer src="/assets/js/maplabel.js" ></script>
          <script src="/assets/js/arcgislink.js" async defer></script>
          <script src="/assets/js/wmsmaptype.js" async defer></script>
          <script src="/assets/js/wms-capabilities.js"></script>

        </body>
      </html>
    );
  }
}
