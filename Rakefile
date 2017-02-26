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

file '_dev.yml' do
  touch '_dev.yml'
end

task :dev => [:dependencies, :'_dev.yml'] do
  sh('bundle exec jekyll serve --drafts --config _config.yml,_local.yml')
end
