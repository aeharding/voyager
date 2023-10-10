import { isNative } from "../../../helpers/device";

export default function Terms() {
  const appName = isNative() ? "Voyager" : location.hostname;

  return (
    <div className="ion-padding">
      <h3>{appName} Privacy Policy</h3>

      <p>Last updated: June 24, 2023</p>

      <p>
        We respect your privacy. When you use {appName}, we proxy information to
        your Lemmy instance in order to overcome CORS restrictions with Lemmy.
        However, we want to assure you that we do not log, sell, or inspect any
        of the data proxied.
      </p>

      <p>
        In order to maintain {appName} functionality, we may collect aggregated
        and anonymized analytics. This data is solely used for the purpose of
        improving and enhancing our services.
      </p>

      <p>
        Your privacy is of utmost importance, and we are committed to keeping
        your information secure. If you have any concerns or questions regarding
        our privacy practices, please contact us.
      </p>

      <p>
        Please note that your Lemmy instance has its own privacy policy. We
        recommend reviewing their privacy policy to understand how they handle
        your data.
      </p>

      <h3>{appName} Terms of Use</h3>

      <p>Last updated: June 24, 2023</p>

      <p>
        THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
        OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
        IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
        CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
        TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
        SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      </p>
    </div>
  );
}
