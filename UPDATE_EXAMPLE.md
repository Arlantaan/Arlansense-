EXAMPLE SCENARIO:

You changed the homepage text 'Welcome' to 'Hello World'

LOCAL COMPUTER:
1. Edit: src/pages/Home.tsx
2. git add .
3. git commit -m 'Updated homepage greeting'
4. git push origin master

HETZNER SERVER:
5. ssh root@91.98.39.86
6. cd /root/newsense
7. git pull origin master          # Downloads Home.tsx changes
8. npm run build                    # Builds new dist folder
9. mv dist /var/www/newsense        # Replaces website files
10. chown -R www-data:www-data /var/www/newsense

NOW VISIT http://91.98.39.86 - You'll see 'Hello World'!

That's the complete process!
