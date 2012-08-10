/**  
 * Copyright (c) 2012, Stefan Graupner. All rights reserved.
 *  
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 * CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 **/

(function($) {
  $.fn.calendarize = function(options)
    {
      var defaults = {
      topBackColor   : "#f01",
      topFrontColor  : "#fff",

      mainBackColor   : "#fefefe",
      mainFrontColor  : "#000",
      
      borderColor     : "#000",

      topFrontShadowColor  : "#333",
      mainBackShadowColor  : "#ccc",
      mainFrontShadowColor : "#000",

      preserveContent : false,

      size      : 32,
      shadow    : 0.1,

      topFont  : "Verdana",
      mainFont : "Arial"
    };

    options = $.extend({}, defaults, options);

    // radius and lineWidth are calculated based on the size
    options.radius    = Math.log(options.size) / Math.log(2 * Math.sqrt(2));
    options.lineWidth = Math.log(options.size) / Math.log(48 * Math.sqrt(2));

    var m_this = this;

    var functions = {
      getAreaData : function(context, area) // context is jQuery context
      {
        if (area === "top")
        {
          if ($(context).attr('data-calendar-top') || $(context).attr('data-calendar'))
          {
            return $(context).attr('data-calendar-top') || ($(context).attr('data-calendar').split(/ /))[0];
          } else $.error("Unable to locate data for top bar.");
        } 
        if (area === "main")
        {
          if ($(context).attr('data-calendar-main') || $(context).attr('data-calendar'))
          {
            return $(context).attr('data-calendar-main') || ($(context).attr('data-calendar').split(/ /))[1];
          } else $.error("Unable to locate data for main area.");
        }
      },

      drawRoundedRect : function(ctx,x,y,size,radius,fill,stroke)
      {
        ctx.save(); // save the context so we don't mess up others
        ctx.beginPath();

        ctx.moveTo(x+radius,y);
        ctx.arcTo(x+size,y,x+size,y+radius,radius);
        ctx.arcTo(x+size,y+size,x+size-radius,y+size,radius); 
        ctx.arcTo(x,y+size,x,y+size-radius,radius);
        ctx.arcTo(x,y,x+radius,y,radius);

        if(fill) ctx.fill();
        if(stroke) ctx.stroke();

        ctx.restore();  // restore context to what it was on entry
      },

      addAlpha : function(hex, alpha) 
      {
        var color = [];

        if (hex.charAt(0) == '#') hex = hex.substring(1, hex.length);
        
        if (hex.length == 3) // short codes
        {
          var str = "";
          for (i = 0; i < 3; i++) 
            str += hex.charAt(i)+hex.charAt(i);
          hex = str;
        }        

        color[0] = parseInt(hex.substring(0, 2), 16);
        color[1] = parseInt(hex.substring(2, 4), 16);
        color[2] = parseInt(hex.substring(4, 6), 16);

        return "rgba("+color[0]+","+color[1]+","+color[2]+","+alpha+")";
      }
    }

    return this.each(function() {
      if (!options.preserveContent) $(this).empty();
      if (!$('canvas', this) || $('canvas', this).attr('data-is-calendarcanvas') !== 1)
      {
        $(this).prepend('<canvas data-is-calendarcanvas="1" />');
      }

      var canvas = $('canvas', this);
      canvas.attr('width', options.size).attr('height', options.size);
      var ctx = canvas[0].getContext("2d");

      ctx.clearRect(0, 0, options.size, options.size);

      // main rounded rect + background
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth   = options.lineWidth;
      ctx.fillStyle = options.mainBackColor;

      var sx, sy;
      sx = sy = 0.5 * options.size * options.shadow;
      var size = options.size - (options.size * options.shadow);
      ctx.shadowColor = options.mainBackShadowColor;
      ctx.shadowBlur  = size * options.shadow;

      ctx.shadowOffsetX = ctx.shadowOffsetY = size * options.shadow / 8;
      
      functions.drawRoundedRect(ctx, sx, sy, size, options.radius, true, true);
      ctx.shadowBlur = ctx.shadowOffsetY = ctx.shadowOffsetX = 0;

      // main content
      ctx.fillStyle   = options.mainFrontColor;

      var fontSize = size * 0.5;
      ctx.font = fontSize+"px "+options.mainFont;
      ctx.textAlign = "center";

      sy   += options.size * 0.15;
      size -= sy;

      var dx, dy;
      dx = options.size / 2;
      dy = options.size / 2 + fontSize / 2;

      ctx.shadowBlur = size * options.shadow * 0.1;
      ctx.shadowColor = options.mainFrontShadowColor;
      ctx.shadowOffsetX = ctx.shadowOffsetY = size * options.shadow / 12;

      var mainStr = functions.getAreaData(this, "main");
      ctx.fillText(mainStr, dx, dy);
      ctx.shadowBlur = ctx.shadowOffsetY = ctx.shadowOffsetX = 0;

      // top bar
      size += sy;

      ctx.beginPath();
      ctx.moveTo(sx + options.radius, sx); // top left corner + radiues
      ctx.arcTo(sx+size, sx, sx+size, sy+options.radius, options.radius);
      ctx.lineTo(sx+size, sy);
      ctx.lineTo(sx, sy);
      ctx.arcTo(sx, sx, sx+options.radius, sx, options.radius);

      var topGradient = ctx.createLinearGradient(size / 2, sx, size / 2, sy);
      topGradient.addColorStop(0, functions.addAlpha(options.topBackColor, 0.25));
      topGradient.addColorStop(0.5, options.topBackColor);
      ctx.fillStyle = topGradient;

      ctx.fill();

      ctx.shadowBlur    = size * options.shadow;
      ctx.shadowOffsetY = size * options.shadow / 8;
      ctx.strokeStyle = options.borderColor;

      ctx.stroke();

      ctx.shadowBlur = 0;

      // top bar content
      fontSize = (sy - sx) * 0.7;
      ctx.textAlign = "center";
      ctx.font = fontSize+"px "+options.topFont;

      ctx.fillStyle = options.topFrontColor;
      ctx.shadowColor = options.topFrontShadowColor;
      ctx.shadowOffsetX = ctx.shadowOffsetY = size * options.shadow / 16;

      var topBarStr = functions.getAreaData(this, "top");
      ctx.fillText(topBarStr, size / 2 + sx, sy - (sy - sx) * 0.3);

      $(canvas).attr('title', topBarStr+" "+mainStr);
    });
  }
})(jQuery);
