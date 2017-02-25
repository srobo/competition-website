task :clean do
  sh('rm -rf _site')
end

task :deep_clean => [:clean] do
  sh('rm -rf gems node_modules')
end

task :dependencies do
  sh('bundle install --path gems')
  sh('npm install')
end

task :dev => [:dependencies] do
  sh('bundle exec jekyll serve --drafts --config _config.yml')
end
