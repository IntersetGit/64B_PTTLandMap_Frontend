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
        </Head>
        <body>
          <Main />
          <div id="app"></div>
          <NextScript />
          <script src="/assets/js/jquery-3.2.1.min.js"></script>
          <script src="/assets/js/popper.min.js"></script>
          <script src="/assets/js/bootstrap.min.js"></script>
          <script src="/assets/js/jquery.slimscroll.min.js"></script>
          <script src="/assets/js/jscoord-1.1.1.js"></script>
          <script src="/assets/js/app.js"></script>
        </body>
      </html>
    );
  }
}
