const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create or get admin user
  let admin;
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
      },
    });
    console.log('✅ Admin user ready');
  } catch (error) {
    admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });
    console.log('✅ Using existing admin user');
  }

  // Create categories
  const cardGamesCategory = await prisma.category.upsert({
    where: { slug: 'card-games' },
    update: {},
    create: {
      name: 'Card Games',
      slug: 'card-games',
      description: 'Download free Teen 3 Patti card games for Android',
    },
  });

  const gamesCategory = await prisma.category.upsert({
    where: { slug: 'games' },
    update: {},
    create: {
      name: 'Games',
      slug: 'games',
      description: 'Latest Teen 3 Patti games and apps',
    },
  });

  const casinoCategory = await prisma.category.upsert({
    where: { slug: 'casino-games' },
    update: {},
    create: {
      name: 'Casino Games',
      slug: 'casino-games',
      description: 'Free casino games and slot games for Android',
    },
  });

  console.log('✅ Categories created');

  // Posts data
  const posts = [
    {
      title: 'Rs 777 Vip Game Download APK Latest Version For Android',
      slug: 'rs-777-vip',
      content: `<h2>Description</h2>
<p>RS 777 Vip Game Pakistan is a genuine mobile game with a free APK download that allows you to earn money. Slot and fishing enthusiasts can now enjoy the latest version and play a variety of games from home. The compact APK file features many exciting games that are sure to captivate you. Whether you prefer live casino games or card games, RS777 Vip offers a free download with endless rewards.</p>

<p>Finding a truly authentic game in the crowded online market can be challenging for newcomers. However, RS 777 Vip Game stands out with its excellent graphics, user-friendly interface, and free lucky spins, making it a great option for poker players. Sharing the download link can also increase your funds. You can earn real money simply by playing the game for a few minutes.</p>

<h2>Why Play RS 777 Vip Game?</h2>
<p>RS777 Vip Game is an online gaming app packed with enjoyable games. It also allows players to make money from the games. It may seem unbelievable, but you'll discover the truth once you download the app.</p>

<p>The game offers various ways to play. You can enjoy the games for fun or earn money. Games like 777, 9 Coins, Roulette, Dragon Tiger, Jili, and Hot games provide high-level entertainment. You can play solo or join a team. The game has many features to help you earn money.</p>

<h2>Features of RS 777 Vip Game APK:</h2>
<p>To ensure you're playing a genuine game, check out the features of RS 777 Vip App:</p>

<p><strong>Multiple Offers:</strong> Enjoy offers like welcome bonuses, daily check-in rewards, cashback offers, and free spins to test your luck.</p>

<p><strong>Cash Prizes:</strong> Win cash prizes and earn rewards by sharing your download link with friends.</p>

<p><strong>Regular Updates:</strong> Developers continuously update the game to provide the best experience and new features.</p>

<p><strong>Multiple Language Support:</strong> Choose from various language options in the settings for the best app experience.</p>

<p><strong>Dedicated Customer Support:</strong> Get help with any game issues through live chat on the WhatsApp group.</p>

<p><strong>Fast Transactions:</strong> Quickly transfer funds to your mobile wallet or bank account with secure transactions.</p>

<h3>Additional Features:</h3>
<ul>
<li>Variety of games</li>
<li>Fair winnings</li>
<li>Live customer support</li>
<li>High-quality graphics</li>
<li>Background music</li>
<li>Multiple bonuses</li>
<li>Compact APK file</li>
<li>Live cricket sports</li>
<li>No subscription required</li>
<li>Safe and secure</li>
</ul>

<h2>How to Download and Install RS 777Vip Game:</h2>
<p>Follow these steps to get the app on your Android device:</p>
<ol>
<li>Click the download button or follow the download link.</li>
<li>Open the game and enter your mobile number and username.</li>
<li>Fill out all the required fields.</li>
<li>Click "RS 777 VIP Game Sign Up" to create a new login.</li>
<li>Remember your game ID.</li>
<li>Enter the game and explore the new features.</li>
<li>Optionally, bind your account with your email and phone number.</li>
</ol>

<h2>How to Deposit Money from RS 777 Vip Game:</h2>
<ol>
<li>Open the app and go to the deposit section.</li>
<li>Check the deposit amount and choose your method.</li>
<li>Click deposit and complete the security checks.</li>
<li>Open your mobile wallet and authorize the transfer.</li>
<li>Wait for the amount to be credited to your account.</li>
<li>After playing, withdraw money using EasyPaisa or JazzCash.</li>
</ol>

<h2>Tips and Tricks to Play Rs 777 VIP Game Pakistan:</h2>
<p>Open the app and explore all available games.</p>
<ul>
<li>Use free coins or bonuses to practice.</li>
<li>Once you're confident, deposit some money.</li>
<li>The outcome of the games often depends on luck.</li>
<li>Enjoy and try your best to win big.</li>
</ul>

<h2>Final Thoughts:</h2>
<p>RS777 Vip Game is a legitimate option for playing and earning money. Download and install the game from our website to start having fun and making money. Invite others to join and boost your daily income. We hope you enjoy your time with the game and win big!</p>

<h2>FAQ's: Frequently Asked Questions</h2>

<p><strong>Is RS 777 Vip Game Real or Fake in Pakistan?</strong></p>
<p>We have downloaded and played RS777Vip Game, and despite some complexities, the game is 100% real and allows you to earn money online. Download the app and create an account to see for yourself. You can also play as a guest to test the game's credibility.</p>

<p><strong>Are the Games in RS 777 Vip Game Free to Download?</strong></p>
<p>The games in RS 777 Vip App are ready to play and do not require separate downloads. You only need to install the app once. The games feature virtual elements like fish, fruits, Jili, tigers, lions, and pandas, reflecting the developers' effort.</p>`,
      categoryId: cardGamesCategory.id,
      published: true,
      appVersion: 'V12',
      appSize: '31.25 MB',
      requirements: 'Android 5.0+',
      downloads: '100k',
      metaTitle: 'Rs 777 Vip Game Download APK V12 Latest Version For Android',
      metaDescription: 'RS 777 Vip Game Download APK is 100% real, don\'t think it is a fake app, create your account and register the log in to earn money.',
      keywords: ['rs 777 vip', 'rs777 vip game', 'teen 3 patti', 'card games', 'android apk'],
    },
    {
      title: '3Patti OK Game Download APK For Android',
      slug: '3patti-ok',
      content: `<h2>Description</h2>
<p>3Patti OK is a popular Teen 3 Patti card game application for Android devices. This game offers an authentic card gaming experience with smooth gameplay and attractive graphics.</p>

<h2>Features:</h2>
<ul>
<li>Real-time multiplayer gameplay</li>
<li>Multiple game modes</li>
<li>User-friendly interface</li>
<li>Regular updates and bug fixes</li>
<li>Secure gaming environment</li>
</ul>

<h2>How to Download:</h2>
<ol>
<li>Click the download button below</li>
<li>Allow installation from unknown sources in your Android settings</li>
<li>Install the APK file</li>
<li>Launch the app and start playing</li>
</ol>`,
      categoryId: cardGamesCategory.id,
      published: true,
      appVersion: 'v1.0.0',
      metaTitle: '3Patti OK Game Download APK For Android v1.0.0',
      metaDescription: 'Download 3Patti OK Game APK for Android. Play Teen 3 Patti card games with real-time multiplayer features.',
      keywords: ['3patti ok', 'teen 3 patti', 'card games', 'android apk'],
    },
    {
      title: 'Lucky 97 Game Download APK V2.0.0 Latest Version Free For Android',
      slug: 'lucky-97-game',
      content: `<h2>Description</h2>
<p>Lucky 97 Game is an exciting card game application that brings the thrill of Teen 3 Patti to your Android device. With version 2.0.0, enjoy enhanced features and improved gameplay.</p>

<h2>What's New in Version 2.0.0:</h2>
<ul>
<li>Improved user interface</li>
<li>Better performance and stability</li>
<li>New game modes added</li>
<li>Enhanced graphics and animations</li>
<li>Bug fixes and optimizations</li>
</ul>

<h2>Features:</h2>
<ul>
<li>Multiple card game variants</li>
<li>Daily rewards and bonuses</li>
<li>Tournament mode</li>
<li>Social features to play with friends</li>
<li>Secure payment options</li>
</ul>`,
      categoryId: gamesCategory.id,
      published: true,
      appVersion: 'V2.0.0',
      metaTitle: 'Lucky 97 Game Download APK V2.0.0 Latest Version Free For Android',
      metaDescription: 'Download Lucky 97 Game APK V2.0.0 for Android. Latest version with improved features and gameplay.',
      keywords: ['lucky 97', 'teen 3 patti', 'card games', 'android apk'],
    },
    {
      title: 'GV 777 Game VIP Download APK Free For Android',
      slug: 'gv-777-game',
      content: `<h2>Description</h2>
<p>GV 777 Game VIP is a premium card gaming application offering exclusive features and VIP benefits. Experience the best of Teen 3 Patti gaming with this VIP edition.</p>

<h2>VIP Features:</h2>
<ul>
<li>Exclusive VIP bonuses</li>
<li>Priority customer support</li>
<li>Special tournaments</li>
<li>Higher withdrawal limits</li>
<li>VIP-only game rooms</li>
</ul>

<h2>Game Features:</h2>
<ul>
<li>Multiple card game variants</li>
<li>Live dealer games</li>
<li>Tournament participation</li>
<li>Daily check-in rewards</li>
<li>Referral bonuses</li>
</ul>

<h2>How to Get VIP Access:</h2>
<ol>
<li>Download and install the app</li>
<li>Create your account</li>
<li>Complete the VIP registration</li>
<li>Enjoy exclusive VIP benefits</li>
</ol>`,
      categoryId: cardGamesCategory.id,
      published: true,
      appVersion: 'V2.1.0',
      metaTitle: 'GV 777 Game VIP Download APK Free For Android V2.1.0',
      metaDescription: 'Download GV 777 Game VIP APK for Android. Get exclusive VIP features and bonuses.',
      keywords: ['gv 777', 'gv 777 vip', 'teen 3 patti', 'card games', 'android apk'],
    },
    {
      title: 'Jeet777 Game | Jeet 777 Download APK | For Android',
      slug: 'jeet777-game',
      content: `<h2>Description</h2>
<p>Jeet777 Game is a popular online gaming platform offering various card games including Teen 3 Patti. Download the latest version and start playing today.</p>

<h2>Features:</h2>
<ul>
<li>Multiple card game options</li>
<li>Real-time multiplayer</li>
<li>Daily bonuses and rewards</li>
<li>Secure gaming platform</li>
<li>Easy withdrawal options</li>
</ul>

<h2>How to Play:</h2>
<ol>
<li>Download and install Jeet777 APK</li>
<li>Register with your mobile number</li>
<li>Complete your profile</li>
<li>Start playing and earning</li>
</ol>

<h2>Payment Methods:</h2>
<ul>
<li>EasyPaisa</li>
<li>JazzCash</li>
<li>Bank transfer</li>
<li>Mobile wallet</li>
</ul>`,
      categoryId: gamesCategory.id,
      published: true,
      appVersion: 'v1.0',
      metaTitle: 'Jeet777 Game | Jeet 777 Download APK | For Android v1.0',
      metaDescription: 'Download Jeet777 Game APK for Android. Play Teen 3 Patti and other card games.',
      keywords: ['jeet777', 'jeet 777', 'teen 3 patti', 'card games', 'android apk'],
    },
    {
      title: 'Lucky Ximi Game | LuckyXimi Download Latest Version For Android',
      slug: 'lucky-ximi-game',
      content: `<h2>Description</h2>
<p>Lucky Ximi Game is a fun and exciting card game application for Android users. Enjoy playing Teen 3 Patti with friends and win real rewards.</p>

<h2>Features:</h2>
<ul>
<li>Simple and intuitive interface</li>
<li>Multiple game rooms</li>
<li>Daily login bonuses</li>
<li>Referral program</li>
<li>24/7 customer support</li>
</ul>

<h2>Download Instructions:</h2>
<ol>
<li>Click the download button</li>
<li>Enable installation from unknown sources</li>
<li>Install the APK file</li>
<li>Open the app and register</li>
<li>Start playing immediately</li>
</ol>`,
      categoryId: gamesCategory.id,
      published: true,
      appVersion: 'v1.0',
      metaTitle: 'Lucky Ximi Game | LuckyXimi Download Latest Version For Android v1.0',
      metaDescription: 'Download Lucky Ximi Game APK latest version for Android. Play Teen 3 Patti card games.',
      keywords: ['lucky ximi', 'teen 3 patti', 'card games', 'android apk'],
    },
    {
      title: 'South Lake Tahoe Casino Download APK Free For Android 2025',
      slug: 'south-lake-tahoe-casino',
      content: `<h2>Description</h2>
<p>South Lake Tahoe Casino is a premium casino gaming application offering slot games, table games, and live casino experiences. Download the latest version for Android.</p>

<h2>Casino Features:</h2>
<ul>
<li>Hundreds of slot games</li>
<li>Live dealer tables</li>
<li>Roulette, Blackjack, and Baccarat</li>
<li>Progressive jackpots</li>
<li>Daily free spins</li>
</ul>

<h2>Welcome Bonus:</h2>
<p>New players receive a generous welcome bonus upon registration. Use bonus codes to unlock additional rewards.</p>

<h2>Security:</h2>
<ul>
<li>SSL encrypted transactions</li>
<li>Fair play guarantee</li>
<li>Licensed gaming platform</li>
<li>Secure payment processing</li>
</ul>`,
      categoryId: casinoCategory.id,
      published: true,
      appVersion: 'v1.0.1',
      metaTitle: 'South Lake Tahoe Casino Download APK Free For Android 2025 v1.0.1',
      metaDescription: 'Download South Lake Tahoe Casino APK for Android. Play casino games and win real money.',
      keywords: ['south lake tahoe casino', 'casino games', 'slot games', 'android apk'],
    },
    {
      title: 'Glory Casino APK Download (Latest Version) Free For Android',
      slug: 'glory-casino-apk',
      content: `<h2>Description</h2>
<p>Glory Casino APK offers an extensive collection of casino games including slots, table games, and live dealer options. Experience the thrill of casino gaming on your Android device.</p>

<h2>Game Collection:</h2>
<ul>
<li>500+ slot games</li>
<li>Live casino games</li>
<li>Poker variants</li>
<li>Roulette and Blackjack</li>
<li>Specialty games</li>
</ul>

<h2>Promotions:</h2>
<ul>
<li>Welcome bonus package</li>
<li>Daily reload bonuses</li>
<li>Cashback offers</li>
<li>VIP rewards program</li>
<li>Tournament prizes</li>
</ul>

<h2>Payment Options:</h2>
<ul>
<li>Credit/Debit cards</li>
<li>E-wallets</li>
<li>Bank transfers</li>
<li>Cryptocurrency</li>
</ul>`,
      categoryId: casinoCategory.id,
      published: true,
      appVersion: 'v5',
      metaTitle: 'Glory Casino APK Download (Latest Version) Free For Android v5',
      metaDescription: 'Download Glory Casino APK latest version for Android. Play casino games and slots.',
      keywords: ['glory casino', 'casino games', 'slot games', 'android apk'],
    },
    {
      title: 'Vegas Casino 777 APK Download Free Slot Games',
      slug: 'vegas-casino-777-apk',
      content: `<h2>Description</h2>
<p>Vegas Casino 777 brings the excitement of Las Vegas to your Android device. Enjoy free slot games and casino classics.</p>

<h2>Slot Games:</h2>
<ul>
<li>Classic 3-reel slots</li>
<li>Video slots with bonus rounds</li>
<li>Progressive jackpot slots</li>
<li>Themed slot games</li>
<li>Daily free spins</li>
</ul>

<h2>Features:</h2>
<ul>
<li>No registration required for free play</li>
<li>Regular updates with new games</li>
<li>Social features</li>
<li>Leaderboards and tournaments</li>
<li>Rewards and bonuses</li>
</ul>`,
      categoryId: casinoCategory.id,
      published: true,
      appVersion: 'V1.0',
      metaTitle: 'Vegas Casino 777 APK Download Free Slot Games V1.0',
      metaDescription: 'Download Vegas Casino 777 APK for Android. Play free slot games and casino classics.',
      keywords: ['vegas casino 777', 'slot games', 'casino games', 'android apk'],
    },
  ];

  // Create posts
  for (const postData of posts) {
    try {
      await prisma.post.upsert({
        where: { slug: postData.slug },
        update: {
          title: postData.title,
          content: postData.content,
          categoryId: postData.categoryId,
          published: postData.published,
          appVersion: postData.appVersion,
          appSize: postData.appSize,
          requirements: postData.requirements,
          downloads: postData.downloads,
          metaTitle: postData.metaTitle,
          metaDescription: postData.metaDescription,
          keywords: postData.keywords,
        },
        create: {
          ...postData,
          authorId: admin.id,
        },
      });
      console.log(`✅ Created/Updated post: ${postData.title}`);
    } catch (error) {
      console.error(`❌ Error creating post ${postData.slug}:`, error.message);
    }
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

