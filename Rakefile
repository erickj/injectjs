require 'erb'
require 'fileutils'
require 'open3'

NAMESPACE = 'inject'
DEFAULT_TARGET = 'inject'

BASE_DIR = FileUtils.pwd
JS_DIR = BASE_DIR + '/lib'
SPEC_DIR = BASE_DIR + '/spec'

BUILD_DIR =  BASE_DIR + '/build'
TEST_BUILD_DIR = BUILD_DIR + '/specs'

THIRD_PARTY_DIR = BASE_DIR + '/third-party'
CLOSURE_LIB_DIR = THIRD_PARTY_DIR + '/closure-library'
CLOSURE_LIB_THIRD_PARTY_DIR = THIRD_PARTY_DIR + '/closure-library-third-party'

BUILD_DIRS = [
              TEST_BUILD_DIR,
             ]

TEST_PROTOCOL = "file://"
SPECHELPER_PATH = File.join(SPEC_DIR, 'spechelper.js');
SPECRUNNER_TPL = '_specrunner.erb'
PHANTOMJS_RUNNER = 'phantomjs run-jasmine.js'
JASMINE_ROOT_PATH = THIRD_PARTY_DIR + '/jasmine-1.3.1'

JS_AUTO_INCLUDES = []
CLOSURE_BUILDER = CLOSURE_LIB_DIR + '/bin/build/closurebuilder.py'
CLOSURE_BUILDER_ROOTS = "--root=#{CLOSURE_LIB_DIR} \
  --root=#{CLOSURE_LIB_THIRD_PARTY_DIR} \
  --root=#{JS_DIR}"
CLOSURE_BUILDER_ROOTS_SPEC = CLOSURE_BUILDER_ROOTS + " --root=spec"
CLOSURE_COMPILER = THIRD_PARTY_DIR + '/closure-compiler/compiler.jar'

GJSLINT = '/usr/local/bin/gjslint'
GJSLINT_EXCLUDES = BASE_DIR + '/.gjslintexcludes'

task :default => [:concat]

desc 'Init the build workspace'
task :init do
  FileUtils.mkdir(BUILD_DIR) unless File.directory?(BUILD_DIR)
  BUILD_DIRS.each do |d|
    FileUtils.mkdir(d) unless File.directory?(d)
  end
end

desc 'Clean any generated files'
task :clean do
  FileUtils.rm_r(BUILD_DIR, :force => true)
  BUILD_DIRS.each do |d|
    FileUtils.rm_r(d, :force => true)
  end
  Rake::Task[:init].invoke
end

namespace :build do
  desc 'Show help for the JS compiler'
  task :help do
    puts %x{java -jar #{CLOSURE_COMPILER} --help 2>&1}
  end

  desc 'Compile JS in WHITESPACE_ONLY mode for [target]'
  task :concat, [:target] => [:init] do |t, args|
    target = args[:target] || DEFAULT_TARGET
    Utils.build_script(Utils.get_js_script_name(target), target)
  end

  desc 'Compile JS in SIMPLE_OPTIMIZATION mode for [target]'
  task :simple, [:target] => [:init] do |t, args|
    target = args[:target] || DEFAULT_TARGET
    Utils.build_compiled(Utils.get_js_script_name(target, 'min'), target)
  end

  desc 'Compile JS in ADVANCED_OPTIMIZAION mode for [target]'
  task :compile, [:target] => [:init] do |t, args|
    target = args[:target] || DEFAULT_TARGET
    Utils.build_compiled(Utils.get_js_script_name(target, 'opt'), target, true)
  end
end

desc 'Lists build dependencies for [target]'
task :deps, [:target] do |t, args|
  puts Utils.get_script_deps(args[:target] || DEFAULT_TARGET)
end

desc 'Run gjslint on the js directory'
task :lint, [:dir] do |t, args|
  dir = JS_DIR
  dir += "/#{args[:dir]}" if args[:dir]
  excludes = File.read(GJSLINT_EXCLUDES).split("\n").map do |f|
    f.match(/^\s*#/) ? nil : File.join(JS_DIR, f)
  end.compact.join(',')
  puts %x{#{GJSLINT} --strict --exclude_files=#{excludes} -r #{dir}}
end

namespace :test do
  desc 'Run spec for [target]'
  task :spec, :target do |t, args|
    target = args[:target]
    target = Utils.specize_target_name(Utils.normalize_target_name(target))
    Utils.run_spec(target)
  end

  desc 'Run all specs for [namespace] or ' + NAMESPACE
  task :specs, :namespace do |t, args|
    ns = Utils.normalize_target_name(args[:namespace] || NAMESPACE, { :no_cap => true })
    spec_build_dir = TEST_BUILD_DIR

    puts "Running specs for namespace [#{ns}]"
    puts
    Dir.glob(File.join(spec_build_dir, ns + "*.html")) do |file|
      puts file
      target = file.split('/').last.gsub('.html','')
      Utils.run_spec(target)
    end
  end

  desc 'Generate spec runner for [target]'
  task :genspec, :target do |t, args|
    target = args[:target]
    target = Utils.specize_target_name(Utils.normalize_target_name(target))
    unless Utils.is_target_spec?(target)
      raise 'Unable to generate spec runner for non spec target'
    end

    Utils.build_specrunner(target)
  end

  desc 'Generate spec runners for [namespace] or ' + NAMESPACE
  task :genspecs, :namespace do |t, args|
    ns = args[:namespace] || ''
    ns.gsub!(/^#{NAMESPACE}\./,'')
    puts "Generating specs for namespace [#{ns}]"
    Utils.find_spec_targets(ns).each do |target|
      Utils.build_specrunner(target)
    end
  end
end

##
# Class needed for the ERB template. See Util.build_specrunner
class SpecRunnerBindingProvider
  attr_accessor :target, :scripts, :jasmine_root, :base_root
  def get_binding
    binding
  end
end

class Utils
  ##
  # Cleans up lazy target names like foo.bar into ns.foo.Bar
  # Options:
  # - :no_cap - don't capitalize the final target
  def self.normalize_target_name(target, opts={})
    ns = target.split('.')
    ns.last.capitalize! unless ns.last[0].match(/[A-Z]/) || opts[:no_cap]
    ns.unshift(NAMESPACE) unless ns[0] == NAMESPACE
    ns.join('.')
  end

  ##
  # Appends "Spec" onto a target if its not there
  def self.specize_target_name(target)
    target.match(/Spec$/) ? target : target << "Spec"
  end

  def self.is_target_spec?(target)
    !!target.match(/.*Spec/)
  end

  def self.get_js_script_name(target, type='')
    get_script_prefix(target, type) << '.js'
  end

  def self.get_script_prefix(target, type='')
    script_name = target.downcase.gsub(/^#{NAMESPACE}\./,'')
    script_name.prepend('test_') if is_target_spec?(target)
    type.empty? ? script_name : script_name << '.' << type
  end

  def self.get_script_deps(js_target, *build_args)
    puts "Listing dependencies for target: #{js_target}"
    build_args ||= []
    build_args << '--output_mode=list'
    deps = build_js(js_target, build_args)
    deps.split.map do |f|
      File.join(BASE_DIR, f.gsub(/^#{BASE_DIR}\/?/,''))
    end
  end

  def self.build_specrunner(target)
    puts
    puts "Building specrunner for target: #{target}"
    script_names = Utils.get_script_deps(target)
    script_names.insert(-2, SPECHELPER_PATH)
    puts script_names

    template_obj = SpecRunnerBindingProvider.new
    template_obj.target = target
    template_obj.scripts = script_names.map { |s| TEST_PROTOCOL + s }
    template_obj.jasmine_root = TEST_PROTOCOL + JASMINE_ROOT_PATH
    template_obj.base_root = TEST_PROTOCOL + BASE_DIR
    template = File.read(SPECRUNNER_TPL)

    output_file = target + '.html'
    path = File.join(TEST_BUILD_DIR, output_file)
    File.open(path, 'w') do |f|
      f.write(ERB.new(template).result(template_obj.get_binding))
    end
    relative_path = path.gsub(/^#{BASE_DIR}\//,'')
    puts "Wrote spec file: #{relative_path}"
  end

  def self.build_script(filename, js_target)
    path = File.join(BUILD_DIR, filename)
    puts "Creating #{path} for namespace #{js_target}..."

    build_args = ['--output_mode=compiled', "--compiler_jar=#{CLOSURE_COMPILER}"]
    build_args.push('-f "--compilation_level=WHITESPACE_ONLY"')
    build_args.push('-f "--flagfile=compiler.flags"')
    build_args.push('-f "--formatting=PRETTY_PRINT"')

    File.open(path, 'w') do |f|
      content = build_js(js_target, build_args)
      f.write(content)
    end
    puts "Wrote file #{path}"
  end

  def self.build_compiled(filename, js_target, advanced=false)
    path = File.join(BUILD_DIR, filename)
    puts "Creating compiled #{path} for namespace #{js_target}..."

    build_args = ['--output_mode=compiled', "--compiler_jar=#{CLOSURE_COMPILER}"]
    build_args.push('-f "--compilation_level=ADVANCED_OPTIMIZATIONS"') if advanced
    build_args.push('-f "--flagfile=compiler.flags"')

    File.open(path, 'w') do |f|
      content = build_js(js_target, build_args)
      f.write(content)
    end
    puts "Wrote file #{path}"
  end

  ##
  # Runs the closure builder with the build arguments for a target. Useful for:
  # - concating source
  # - compiling source
  # - listing target dependencies
  def self.build_js(js_target, *build_args)
    JS_AUTO_INCLUDES.each do |inc|
      build_args.push('--input=%s'%inc)
    end
    build_roots = is_target_spec?(js_target) ? CLOSURE_BUILDER_ROOTS_SPEC : CLOSURE_BUILDER_ROOTS
    stdin, stdout, stderr, wait_thrd = Open3.popen3 <<EOS
    #{CLOSURE_BUILDER} \
      #{build_roots} \
      --namespace="#{js_target}" \
      #{build_args.join(' ')}
EOS

    err = stderr.read
    if wait_thrd.value.exitstatus > 0
      $stderr.puts "Error running #{CLOSURE_BUILDER}:"
      $stderr.puts
      $stderr.puts err
    elsif err.length > 0
      cleaned_err_output = err.gsub(/^#{CLOSURE_BUILDER}:\s*/,'')
      $stderr.puts cleaned_err_output
    end

    ret = stdout.read

    stdin.close
    stdout.close
    stderr.close

    ret
  end

  ##
  # Greps through the spec directory for goog.provide target names.
  # returns Array
  def self.find_spec_targets(ns='')
    dir = File.join('spec',ns)
    specs = %x{find #{dir} -name "[a-z0-9]*js" | xargs -I{} grep -e "goog.provide(\'.*Spec\')" {} | cut -d: -f2 | cut -d\\\' -f2}
    specs.split
  end

  ##
  # Run the spec in phantomjs
  def self.run_spec(target)
    spec_url = TEST_PROTOCOL + File.join(TEST_BUILD_DIR, "#{target}.html")
    puts "Running Spec for #{target}"
    puts %x{#{PHANTOMJS_RUNNER} #{spec_url}}
  end

end
