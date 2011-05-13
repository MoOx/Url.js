/**
 * Url class to handle URL properties
 * 
 * @version 1.2
 * @author Maxime Thirouin <maxime.thirouin@gmail.com>
 */

(function()
{
    var Url = function(url, useUTF8)
    {
        var urlNode;

        this.setUseUTF8(typeof useUTF8 != 'undefined' ? useUTF8 : Url.useUTF8);
        
        if (url)
        {
            var a = document.createElement('a');
            a.href = url;
            urlNode = a;
        }
        else
        {
            urlNode = window.location;
        }

        for(i in this._urlAttributes)
        {
            this[this._urlAttributes[i]] = urlNode[this._urlAttributes[i]];
        }

        if (this.port == 0)
        {
            this.port = null;
        }

        if (this.search.length > 0)
        {
            this.query = this.parseQuery(this.search.substring(1));
        }

        this.query || (this.query = {});
    };

    Url.prototype._urlAttributes = [
        'protocol', 'host', 'port', 'pathname', 'search', 'hash',
        'baseURI', 'hostname', 'href', 'hreflang', 'origin'
    ];

    Url.prototype.parseQuery = function(queryString)
    {
        var values = {};
        var vars = queryString.split('&');
        
        if(vars.length > 0)
        {
            for(var i = 0; i < vars.length; i++)
            {
                if(typeof vars[i] == 'string' && vars[i] != '')
                {
                    var parts = vars[i].split('=');
                    if(parts.length > 0)
                    {
                        //log('Decode: ', parts[0], this.decoder(parts[0]), parts[1], this.decoder(parts[1]));
                        values[this.decoder(parts[0])] = this.decoder(parts[1]).replace(/\+/g, ' ') || true;
                    }
                }
            }
        }

        return values;
    };

    Url.prototype.updateSearch = function()
    {
        var queryString = [];
        for (key in this.query)
        {
            //log('Encode: ', key, this.encoder(key), this.query[key], this.encoder(this.query[key]));
            queryString.push(this.encoder(key) + '=' + this.encoder(this.query[key]));
        }
        this.search = '?' + queryString.join('&');

        return this;
    }

    /**
     * Generate url from parameters
     * <protocol>//<host>[:<port>]/<pathname>[<search>][<hash>]
     */
    Url.prototype.toString = function()
    {
        this.updateSearch();
        return this.protocol + '//' + this.host + ( (this.port && this.port != 80) ? ':' + this.port : '') + this.pathname + this.search + this.hash;
    }

    // ENCODING solutions

    Url.useUTF8 = true;

    Url.prototype.setUseUTF8 = function(useUTF8)
    {
        this.useUTF8 = useUTF8;

        if (this.useUTF8)
        {
            this._encoder = encodeURIComponent;
            this._decoder = decodeURIComponent;
        }
        else
        {
            this._encoder = Url.encodeURIComponentISO;
            this._decoder = Url.decodeURIComponentISO;
        }

        this.encoder = function(s)
        {
            s = s.replace(/ /g,  "+");
            return this._encoder(s);
        }

        this.decoder = function(s)
        {
            s = s.replace(/\+/g,  " ");
            return this._decoder(s);
        }

    }
    
    // encodeURIComponent() is the good function
    // // the problem is it works only for utf-8 content...
    // escape() is a good start for ISO, but I does not encode these characters:
    // * @ - _ + . /
    Url.encodeURIComponentISO = function(s)
    {
        return Url._encodeOrDecodeURIComponentISO(s, true);
    }
    
    Url.decodeURIComponentISO = function(s)
    {
        return Url._encodeOrDecodeURIComponentISO(s, false);
    }
    
    Url._encodeOrDecodeURIComponentISO = function(s, encode)
    {
        var fnBase = encode ? escape : unescape;
        // we use encode/decodeURIComponent because we know for the listed character the ISO en UTF8 are the same
        var fnComplementary = encode ? encodeURIComponent : decodeURIComponent;

        s = fnBase(s);
        
        $.each('* @ /'.split(' '), function(i, item)
        {
            s = s.replace(new RegExp('\\' + item, 'g'), fnComplementary(item));
        });

        return s;
    }

    window.Url = Url;
    
})();
