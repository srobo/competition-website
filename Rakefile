task :clean do
  sh('rm -rf _site')
end

task :deep_clean => [:clean] do
  sh('rm -rf gems')
end

task :dependencies do
  sh('bundle install --path gems')
end

file '_local.yml' do
  touch '_local.yml'
end

task :dev => [:dependencies, :'_local.yml'] do
  sh('bundle exec jekyll serve --drafts --config _config.yml,_local.yml')
end
