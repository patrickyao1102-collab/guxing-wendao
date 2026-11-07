import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        application.isIdleTimerDisabled = true          // 玩的时候不自动锁屏（对齐安卓 KEEP_SCREEN_ON）
        let w = UIWindow(frame: UIScreen.main.bounds)
        w.rootViewController = GameViewController()
        w.makeKeyAndVisible()
        self.window = w
        return true
    }
}
