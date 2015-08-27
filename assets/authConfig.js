var configForDevelopment = {
    httpInterceptor: true,
    loginRedirect: '/#courses',
    providers: {
        google: {
            clientId: '188698401713-85riojkr3q7a19nbsgc256e6bpelnhbo.apps.googleusercontent.com',
            redirectUri: 'http://localhost:1337/auth/google',
            scope : [
             'profile',
             'email',
             'https://www.googleapis.com/auth/youtube',
             'https://www.googleapis.com/auth/youtubepartner-channel-audit',
             'https://www.googleapis.com/auth/youtube.readonly'
            ]
        } 
        ,
        linkedin:{
            clientId:'778mif8zyqbei7'
        },
        facebook:{
            clientId:'1603620183220498'
        }
    }
};

var configForProduction = {
    providers: {
        google: {
            clientId: '188698401713-85riojkr3q7a19nbsgc256e6bpelnhbo.apps.googleusercontent.com'
        } 
        ,
        linkedin:{
            clientId:'7561959vdub4x1'
        },
        facebook:{
            clientId:'1603620183220498'
        }

    }
};
var config ;
if (window.location.hostname==='localhost') {
    config = configForDevelopment;
}
else{
    config = configForProduction;
}


export default config;