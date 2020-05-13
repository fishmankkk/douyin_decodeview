const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  ctx.state = {
    title: 'dy project'
  };

  await ctx.render('index', {});
})

module.exports = router