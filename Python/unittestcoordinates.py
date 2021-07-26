from coordinatesSpider import startProcess
import unittest


class TestCoordinate(unittest.TestCase):
    def test_coordinates(self):
        coordinates = startProcess("countdown avonhead")
        self.assertIs(type(coordinates), dict)

    def test_redo(self):
        coordinates = startProcess("countdown avonhead")
        self.assertIs(type(coordinates), dict)


if __name__ == '__main__':
    unittest.main()
